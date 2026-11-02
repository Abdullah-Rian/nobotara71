import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';
const REQUEST_TIMEOUT_MS = 45000;

function withTimeout<T>(promise: Promise<T>, ms: number = REQUEST_TIMEOUT_MS): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json({ limit: '20mb' }));

  // Helper to get GoogleGenAI client
  function getGenAIClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }

  // 1. Text / Standard Generation endpoint
  app.post('/api/generate', async (req, res) => {
    try {
      const { query, mode, attachments, personalization } = req.body;

      const ai = getGenAIClient();
      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY not configured on server',
          fallback: true,
        });
      }

      const attachmentNote = Array.isArray(attachments) && attachments.length > 0
        ? `\nAttached Flight Telemetry / Star Data / Documents: ${attachments.map((a: any) => `${a.name} (${a.type}, ${a.size})`).join(', ')}`
        : '';

      const personaInstruction = personalization?.enabled
        ? `Address the space explorer as ${personalization.userName} (${personalization.userRole}). Tone: ${personalization.tone}. Directives: ${personalization.customDirectives}.`
        : 'Provide a scientifically accurate, awe-inspiring, and thoroughly detailed space exploration response.';

      const prompt = `System: You are SpaceAI, a premier astrophysics, NASA missions, and cosmology intelligence engine. You specialize in space exploration history (Apollo 11, Artemis, Voyager, Mars rovers, JWST, Hubble), planetary astronomy (Mars geology, lunar phenomena, gas giants), stellar dynamics, black holes, orbital mechanics, and universe mysteries. Answer questions with scientific accuracy, real mission telemetry, physical units (AU, km/s, light-years), and clear explanations. ${personaInstruction}
Mode: ${mode || 'Standard'}
User Space Query: "${query || ''}"${attachmentNote}`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        }),
        REQUEST_TIMEOUT_MS
      );

      const text = response.text || 'Processed celestial inquiry.';
      return res.json({ text });
    } catch (error: any) {
      console.warn('[API /api/generate fallback]:', error.message || error);
      return res.status(200).json({
        fallback: true,
        error: error.message || 'Server request fallback',
      });
    }
  });

  // 2. Streaming Generation endpoint (Server-Sent Events)
  app.post('/api/generate/stream', async (req, res) => {
    try {
      const { query, mode, attachments, personalization } = req.body;

      const ai = getGenAIClient();
      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY not configured on server',
          fallback: true,
        });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      const attachmentNote = Array.isArray(attachments) && attachments.length > 0
        ? `\nAttached Flight Telemetry / Star Data / Documents: ${attachments.map((a: any) => `${a.name} (${a.type}, ${a.size})`).join(', ')}`
        : '';

      const personaInstruction = personalization?.enabled
        ? `Address the space explorer as ${personalization.userName} (${personalization.userRole}). Tone: ${personalization.tone}. Directives: ${personalization.customDirectives}.`
        : 'Provide a scientifically accurate, awe-inspiring, and thoroughly detailed space exploration response.';

      const prompt = `System: You are SpaceAI, a premier astrophysics, NASA missions, and cosmology intelligence engine. You specialize in space exploration history (Apollo 11, Artemis, Voyager, Mars rovers, JWST, Hubble), planetary astronomy (Mars geology, lunar phenomena, gas giants), stellar dynamics, black holes, orbital mechanics, and universe mysteries. Answer questions with scientific accuracy, real mission telemetry, physical units (AU, km/s, light-years), and clear explanations. ${personaInstruction}
Mode: ${mode || 'Standard'}
User Space Query: "${query || ''}"${attachmentNote}`;

      const responseStream = await withTimeout(
        ai.models.generateContentStream({
          model: 'gemini-3.8-flash',
          contents: prompt,
        }),
        REQUEST_TIMEOUT_MS
      );

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      return res.end();
    } catch (error: any) {
      console.warn('[API /api/generate/stream error]:', error.message || error);
      if (!res.headersSent) {
        return res.status(200).json({ fallback: true, error: error.message || 'Stream fallback' });
      }
      res.write(`data: ${JSON.stringify({ error: error.message || 'Stream interrupted' })}\n\n`);
      return res.end();
    }
  });

  // 3. Multi-turn Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;

      const ai = getGenAIClient();
      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY not configured on server',
          fallback: true,
        });
      }

      const formattedContents = (messages || []).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content || m.text || '' }],
      }));

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: formattedContents,
          config: systemInstruction ? { systemInstruction } : undefined,
        }),
        REQUEST_TIMEOUT_MS
      );

      return res.json({ text: response.text || '' });
    } catch (error: any) {
      console.warn('[API /api/chat error]:', error.message || error);
      return res.status(200).json({
        fallback: true,
        error: error.message || 'Chat fallback',
      });
    }
  });

  // 4. Gemini Live API WebSocket endpoint (/api/live)
  const wss = new WebSocketServer({ server, path: '/api/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    const ai = getGenAIClient();
    if (!ai) {
      clientWs.send(JSON.stringify({
        type: 'error',
        message: 'GEMINI_API_KEY not configured on server. Live API unavailable.',
      }));
      clientWs.close();
      return;
    }

    try {
      let liveSession: any = null;

      liveSession = await withTimeout(
        ai.live.connect({
          model: 'gemini-3.8-live',
          config: {
            responseModalities: ['AUDIO'] as any,
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are SpaceAI, a premier astrophysics and NASA cosmology intelligence engine speaking to a cosmic explorer.',
          },
          callbacks: {
            onmessage: (message: any) => {
              if (clientWs.readyState === WebSocket.OPEN) {
                const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audio) {
                  clientWs.send(JSON.stringify({ type: 'audio', audio }));
                }
                const text = message.serverContent?.modelTurn?.parts?.find((p: any) => p.text)?.text;
                if (text) {
                  clientWs.send(JSON.stringify({ type: 'text', text }));
                }
                if (message.serverContent?.interrupted) {
                  clientWs.send(JSON.stringify({ type: 'interrupted', interrupted: true }));
                }
              }
            },
            onclose: () => {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.close();
              }
            },
            onerror: (err: any) => {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'error', message: err?.message || 'Live session error' }));
              }
            },
          },
        }),
        REQUEST_TIMEOUT_MS
      );

      clientWs.on('message', (data: Buffer | string) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio && liveSession?.sendRealtimeInput) {
            liveSession.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (parsed.text && liveSession?.send) {
            liveSession.send({
              clientContent: {
                turns: [{
                  role: 'user',
                  parts: [{ text: parsed.text }],
                }],
                turnComplete: true,
              },
            });
          }
        } catch (err) {
          console.warn('[Live API ws error processing message]:', err);
        }
      });

      clientWs.on('close', () => {
        try {
          if (liveSession && typeof liveSession.close === 'function') {
            liveSession.close();
          }
        } catch (_) {}
      });
    } catch (liveErr: any) {
      console.warn('[Live API connection failed]:', liveErr.message || liveErr);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({
          type: 'error',
          message: liveErr?.message || 'Failed to establish Live session',
        }));
        clientWs.close();
      }
    }
  });

  // 5. Mount Vite middlewares in development or static dist in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[SpaceAI Server] Running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[SpaceAI Server Startup Error]:', err);
  process.exit(1);
});
