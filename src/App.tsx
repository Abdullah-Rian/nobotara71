/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import SpaceAIChat from './SpaceAIChat';

type MissionKey = 'apollo11' | 'earth' | 'voyager1';
type ModalView = null | 'dossier' | 'purpose' | 'policy' | 'team' | 'spaceai';
type SfxType = 'switch' | 'cta' | 'menu';

interface MissionTelemetry {
  label: string;
  value: string;
  unit?: string;
}

interface MissionData {
  name: string;
  eyebrow: string;
  titleLines: [string, string];
  description: string;
  dockLabel: string;
  video: string;
  still: string;
  cutout: string;
  telemetry: MissionTelemetry[];
  highlights: string[];
}

const MISSIONS: Record<MissionKey, MissionData> = {
  apollo11: {
    name: 'Apollo 11',
    eyebrow: 'MISSION: APOLLO 11',
    titleLines: ['ONE GIANT', 'LEAP'],
    description:
      "Humanity's first lunar landing on July 20, 1969. Explore the historic Sea of Tranquility landing site and Eagle lunar module.",
    dockLabel: 'APOLLO 11',
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_b211cd74-013b-4dd3-bfd0-64491d8696fa.mp4',
    still:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_cf55d1d8-7b59-4a64-80da-d72052ae974e.png',
    cutout: '/manus-storage/apollo-11-button_aa8371ce.png',
    telemetry: [
      { label: 'Lunar Landing', value: '20:17:40', unit: 'UTC' },
      { label: 'Surface Stay', value: '21.6', unit: 'HOURS' },
      { label: 'Lunar Coordinates', value: '0.674° N', unit: '23.473° E' },
      { label: 'Samples Recovered', value: '21.55', unit: 'KG' },
    ],
    highlights: [
      'Touchdown at Mare Tranquillitatis (Sea of Tranquility) with 25 seconds of fuel remaining.',
      'First human footsteps imprinted on the lunar regolith by Neil Armstrong and Buzz Aldrin.',
      'Successful lunar module ascent stage rendezvous with Command Module Columbia in lunar orbit.',
    ],
  },
  earth: {
    name: 'Earth',
    eyebrow: 'MISSION: EARTH',
    titleLines: ['BLUE', 'MARBLE'],
    description:
      'Learn more about the fascinating details that we call our home, Planet Earth.',
    dockLabel: 'EARTH',
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202422_3ffb4889-c520-432d-8458-038009eb40df.mp4',
    still:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_508c64b8-a31e-4290-bdfc-1187df70e0a6.png',
    cutout:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202005_3346cc4d-ec3b-44ab-825c-b18e49f5021a.png',
    telemetry: [
      { label: 'Orbital Distance', value: '1.000', unit: 'AU' },
      { label: 'Mean Diameter', value: '12,742', unit: 'KM' },
      { label: 'Surface Water', value: '70.8', unit: '%' },
      { label: 'Orbital Velocity', value: '29.78', unit: 'KM/S' },
    ],
    highlights: [
      'Only known harbor of life in the cosmos with a self-regulating biosphere and liquid oceans.',
      'Active geomagnetic dynamo shield deflecting solar wind and cosmic radiation.',
      'Nitrogen-oxygen atmosphere maintaining stable equilibrium temperatures for over 3 billion years.',
    ],
  },
  voyager1: {
    name: 'Voyager 1',
    eyebrow: 'MISSION: VOYAGER 1',
    titleLines: ['THE GOLDEN', 'DISK'],
    description:
      "Humanity's farthest emissary in interstellar space, carrying the Golden Record past the heliopause into the cosmic deep.",
    dockLabel: 'VOYAGER 1',
    video: '/manus-storage/voyager-1-loop-4k_bf38cfe9.mp4',
    still:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_0ba6de7c-285d-43dc-b7ab-8c54c73707cb.png',
    cutout: '/manus-storage/voyager-1-button_0ba1923d.png',
    telemetry: [
      { label: 'Heliocentric Distance', value: '165.2', unit: 'AU' },
      { label: 'Escape Velocity', value: '17.0', unit: 'KM/S' },
      { label: 'Signal One-Way Time', value: '22.9', unit: 'HOURS' },
      { label: 'Golden Record', value: '115', unit: 'IMAGES' },
    ],
    highlights: [
      'Crossed the heliopause into interstellar space on August 25, 2012 — 121 AU from the Sun.',
      'Carries the 12-inch gold-plated copper phonograph record encoded with Earth sounds, greetings, and diagrams.',
      'Continuous telemetry returned via the Deep Space Network across a distance exceeding 24 billion kilometers.',
    ],
  },
};

const DOCK_ORDER: MissionKey[] = ['apollo11', 'earth', 'voyager1'];

// Pre-renders sound effect PCM samples into a reusable AudioBuffer
async function renderSfxBuffer(ctx: AudioContext, type: SfxType): Promise<AudioBuffer> {
  const sampleRate = ctx.sampleRate || 44100;
  const duration = type === 'cta' ? 0.24 : type === 'switch' ? 0.12 : 0.09;
  const length = Math.max(1, Math.ceil(sampleRate * duration));

  const OfflineCtxClass =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;

  if (OfflineCtxClass) {
    try {
      const offlineCtx = new OfflineCtxClass(1, length, sampleRate);
      const now = 0;

      if (type === 'cta') {
        // Dual-oscillator futuristic telemetry chime for mission activation
        const osc1 = offlineCtx.createOscillator();
        const gain1 = offlineCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.16); // D6
        gain1.gain.setValueAtTime(0.18, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc1.connect(gain1);
        gain1.connect(offlineCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.22);

        const osc2 = offlineCtx.createOscillator();
        const gain2 = offlineCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now + 0.03); // A5
        osc2.frequency.exponentialRampToValueAtTime(1480, now + 0.19);
        gain2.gain.setValueAtTime(0.12, now + 0.03);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc2.connect(gain2);
        gain2.connect(offlineCtx.destination);
        osc2.start(now + 0.03);
        osc2.stop(now + 0.22);
      } else if (type === 'switch') {
        // Crisp tactile dock switch frequency sweep
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
        osc.connect(gain);
        gain.connect(offlineCtx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
      } else {
        // Subdued interface pip for menu / modal toggle
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.06);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.connect(gain);
        gain.connect(offlineCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      }

      return await offlineCtx.startRendering();
    } catch {
      // Fall through to Float32Array PCM synthesis fallback
    }
  }

  // Fallback direct PCM synthesis into AudioBuffer
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const channelData = buffer.getChannelData(0);
  let phase1 = 0;
  let phase2 = 0;

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (type === 'cta') {
      const f1 = 587.33 * Math.pow(1174.66 / 587.33, Math.min(1, t / 0.16));
      phase1 += (2 * Math.PI * f1) / sampleRate;
      const env1 = 0.18 * Math.max(0, 1 - t / 0.22);
      sample += (2 / Math.PI) * Math.asin(Math.sin(phase1)) * env1;

      if (t >= 0.03) {
        const f2 = 880 * Math.pow(1480 / 880, Math.min(1, (t - 0.03) / 0.16));
        phase2 += (2 * Math.PI * f2) / sampleRate;
        const env2 = 0.12 * Math.max(0, 1 - t / 0.22);
        sample += Math.sin(phase2) * env2;
      }
    } else if (type === 'switch') {
      const f = 520 * Math.pow(880 / 520, Math.min(1, t / 0.09));
      phase1 += (2 * Math.PI * f) / sampleRate;
      const env = 0.1 * Math.max(0, 1 - t / 0.11);
      sample = Math.sin(phase1) * env;
    } else {
      const f = 440 * Math.pow(620 / 440, Math.min(1, t / 0.06));
      phase1 += (2 * Math.PI * f) / sampleRate;
      const env = 0.08 * Math.max(0, 1 - t / 0.08);
      sample = Math.sin(phase1) * env;
    }

    channelData[i] = Math.max(-1, Math.min(1, sample));
  }

  return buffer;
}

export default function App() {
  const [currentMission, setCurrentMission] = useState<MissionKey>('apollo11');
  const [navOpen, setNavOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalView>(null);
  const [view, setView] = useState<'home' | 'chat'>('home');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [spaceAiPrompt, setSpaceAiPrompt] = useState('');
  const [spaceAiLog, setSpaceAiLog] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Nobotara71 SpaceAI telemetry link active. Ask about Apollo 11, Planet Earth orbital science, or Voyager 1 interstellar data.',
    },
  ]);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Partial<Record<SfxType, AudioBuffer>>>({});
  const videoRefs = useRef<Record<MissionKey, HTMLVideoElement | null>>({
    apollo11: null,
    earth: null,
    voyager1: null,
  });

  // Helper to lazily instantiate and retrieve the shared AudioContext
  const getAudioContext = (): AudioContext | null => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  };

  // Pre-warms shared AudioBuffers for all sound effect types
  const warmAudioBuffers = async (ctx: AudioContext) => {
    const types: SfxType[] = ['cta', 'switch', 'menu'];
    await Promise.all(
      types.map(async (t) => {
        if (!audioBuffersRef.current[t]) {
          try {
            audioBuffersRef.current[t] = await renderSfxBuffer(ctx, t);
          } catch {
            // Buffer creation fallback handled in renderSfxBuffer
          }
        }
      })
    );
  };

  // Pre-warm AudioContext and cache all sound buffers on first user interaction to eliminate latency
  useEffect(() => {
    const handleFirstGesture = () => {
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        warmAudioBuffers(ctx).catch(() => {});
      }
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  // Web Audio API Synthesizer using shared pre-rendered AudioBuffers for sample-accurate, zero-latency playback
  const playSfx = (type: SfxType) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const playFromBuffer = (buf: AudioBuffer) => {
        try {
          const source = ctx.createBufferSource();
          source.buffer = buf;
          source.connect(ctx.destination);
          source.start(0);
        } catch {
          // Ignore playback errors if audio channel disconnected
        }
      };

      const executePlay = async () => {
        let buf = audioBuffersRef.current[type];
        if (!buf) {
          buf = await renderSfxBuffer(ctx, type);
          audioBuffersRef.current[type] = buf;
        }
        playFromBuffer(buf);
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(executePlay).catch(executePlay);
      } else {
        executePlay();
      }
    } catch {
      // Ignore audio errors if blocked by browser autoplay policy
    }
  };

  const warmVideo = (planet: MissionKey) => {
    const vid = videoRefs.current[planet];
    if (vid && !vid.getAttribute('src') && vid.dataset.src) {
      vid.setAttribute('preload', 'auto');
      vid.setAttribute('src', vid.dataset.src);
      vid.load();
    }
  };

  // Sync active background video playback
  useEffect(() => {
    DOCK_ORDER.forEach((key) => {
      const vid = videoRefs.current[key];
      if (!vid) return;
      if (key === currentMission) {
        if (!vid.getAttribute('src') && vid.dataset.src) {
          vid.setAttribute('src', vid.dataset.src);
          vid.load();
        }
        vid.classList.add('is-active');
        const p = vid.play();
        if (p !== undefined) {
          p.catch(() => {});
        }
      } else {
        vid.classList.remove('is-active');
        vid.pause();
      }
    });
  }, [currentMission]);

  // Warm remaining videos during browser idle
  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof win.requestIdleCallback === 'function') {
      const id = win.requestIdleCallback(() => DOCK_ORDER.forEach(warmVideo), { timeout: 3500 });
      return () => {
        if (typeof win.cancelIdleCallback === 'function') win.cancelIdleCallback(id);
      };
    } else {
      const timer = window.setTimeout(() => DOCK_ORDER.forEach(warmVideo), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Close menu/modals on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNavOpen(false);
        setActiveModal(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSelectMission = (key: MissionKey) => {
    if (key === currentMission) return;
    playSfx('switch');
    setCurrentMission(key);
    setNavOpen(false);
  };

  const handleGetStarted = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Dismiss any open hamburger dropdown
    setNavOpen(false);
    // Play the tactile dual-tone CTA chime
    playSfx('cta');
    // Open the interactive mission dossier modal
    setActiveModal('dossier');
  };

  const handleOpenSpaceAi = () => {
    playSfx('cta');
    setNavOpen(false);
    setView('chat');
  };

  const handleSpaceAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = spaceAiPrompt.trim();
    if (!q) return;
    playSfx('switch');
    const lower = q.toLowerCase();
    let reply = '';
    if (lower.includes('apollo') || lower.includes('moon') || lower.includes('lunar')) {
      reply =
        'Apollo 11 landed at Mare Tranquillitatis (0.674° N, 23.473° E) on July 20, 1969 at 20:17 UTC. Eagle stayed on the lunar surface for 21 hours and 36 minutes.';
    } else if (lower.includes('voyager') || lower.includes('golden') || lower.includes('interstellar')) {
      reply =
        'Voyager 1 is currently over 165 AU from Earth moving at 17.0 km/s through the interstellar medium, carrying the 12-inch gold-plated copper Golden Record.';
    } else if (lower.includes('earth') || lower.includes('marble') || lower.includes('home')) {
      reply =
        'Planet Earth orbits at 1.0 AU (149.6 million km) with an equatorial radius of 6,378.1 km, 70.8% liquid water surface coverage, and a protective magnetosphere.';
    } else {
      const active = MISSIONS[currentMission];
      reply = `[${active.eyebrow}] ${active.description} Key metric: ${active.telemetry[0].label} — ${active.telemetry[0].value} ${active.telemetry[0].unit || ''}.`;
    }
    setSpaceAiLog((prev) => [...prev, { role: 'user', text: q }, { role: 'assistant', text: reply }]);
    setSpaceAiPrompt('');
  };

  const mission = MISSIONS[currentMission];

  return (
    <>
    <div className="app-shell">
      <div className="device-viewport">
        {/* 1. Full-Bleed Background Video Engine */}
        <div
          className="sky-stage"
          style={{ backgroundImage: `url(${mission.still})` }}
        >
          <video
            ref={(el) => {
              videoRefs.current.apollo11 = el;
            }}
            data-planet="apollo11"
            className={currentMission === 'apollo11' ? 'is-active' : ''}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            src={MISSIONS.apollo11.video}
            poster={MISSIONS.apollo11.still}
            aria-hidden="true"
          />
          <video
            ref={(el) => {
              videoRefs.current.earth = el;
            }}
            data-planet="earth"
            className={currentMission === 'earth' ? 'is-active' : ''}
            muted
            loop
            playsInline
            preload="none"
            data-src={MISSIONS.earth.video}
            poster={MISSIONS.earth.still}
            aria-hidden="true"
          />
          <video
            ref={(el) => {
              videoRefs.current.voyager1 = el;
            }}
            data-planet="voyager1"
            className={currentMission === 'voyager1' ? 'is-active' : ''}
            muted
            loop
            playsInline
            preload="none"
            data-src={MISSIONS.voyager1.video}
            poster={MISSIONS.voyager1.still}
            aria-hidden="true"
          />
        </div>

        {/* Ambient Starfield & Scrim */}
        <div className="starfield" aria-hidden="true" />
        <div className="sky-scrim" aria-hidden="true" />

        {/* 2. Unified Master HUD Layer */}
        <div className="hud-layer">
          {/* Top Header */}
          <header ref={headerRef} className="top-header">
            <a
              href="#top"
              className="brandmark"
              onClick={(e) => {
                e.preventDefault();
                playSfx('menu');
                setActiveModal(null);
                setNavOpen(false);
              }}
            >
              {/* Orbital Planet Ring SVG matching screenshot */}
              <svg
                className="brandmark-icon"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="10"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                />
                <ellipse
                  cx="20"
                  cy="20"
                  rx="17.5"
                  ry="5.8"
                  transform="rotate(-26 20 20)"
                  stroke="#FFFFFF"
                  strokeWidth="2.3"
                />
              </svg>
              <span className="brandmark-text">
                Nobotara<span>71</span>
              </span>
            </a>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="header-spaceai-btn"
                onClick={handleOpenSpaceAi}
                aria-label="Launch SpaceAI Assistant"
              >
                <span>🪐</span>
                <span>SpaceAI</span>
              </button>

              <button
                type="button"
                className="hamburger-btn"
                data-open={navOpen ? 'true' : 'false'}
                aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={navOpen}
                onClick={() => {
                  playSfx('menu');
                  setNavOpen((prev) => !prev);
                }}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </header>

          {/* Slide-Out / Popover Hamburger Menu */}
          {navOpen && (
            <nav className="nav-dropdown" aria-label="Site navigation">
              <button
                type="button"
                className={`nav-item-btn ${activeModal === null ? 'is-current' : ''}`}
                onClick={() => {
                  playSfx('menu');
                  setActiveModal(null);
                  setNavOpen(false);
                }}
              >
                <span>Missions</span>
                <span className="text-xs font-mono text-[#00E5FF]">03 ACTIVE</span>
              </button>
              <button
                type="button"
                className="nav-item-btn"
                onClick={() => {
                  playSfx('menu');
                  setActiveModal('purpose');
                  setNavOpen(false);
                }}
              >
                <span>Purpose</span>
                <span className="text-xs text-slate-400">↗</span>
              </button>
              <button
                type="button"
                className="nav-item-btn"
                onClick={() => {
                  playSfx('menu');
                  setActiveModal('policy');
                  setNavOpen(false);
                }}
              >
                <span>Policy</span>
                <span className="text-xs text-slate-400">↗</span>
              </button>
              <button
                type="button"
                className="nav-item-btn"
                onClick={() => {
                  playSfx('menu');
                  setActiveModal('team');
                  setNavOpen(false);
                }}
              >
                <span>Team</span>
                <span className="text-xs text-slate-400">↗</span>
              </button>
              <button
                type="button"
                className="nav-item-btn"
                aria-label={soundEnabled ? 'Mute telemetry audio' : 'Unmute telemetry audio'}
                onClick={() => {
                  setSoundEnabled((prev) => !prev);
                }}
              >
                <span>Telemetry Audio SFX</span>
                <span className="inline-flex items-center justify-center">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.75)] transition-colors" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-[#FF3B5C] drop-shadow-[0_0_8px_rgba(255,59,92,0.75)] transition-colors" />
                  )}
                </span>
              </button>
              <button
                type="button"
                className="nav-spaceai-btn"
                onClick={handleOpenSpaceAi}
              >
                SpaceAI
              </button>
            </nav>
          )}

          {/* Hero Typography & Frosted Description Card */}
          <div className="hero-header-block">
            <div className="mission-eyebrow">{mission.eyebrow}</div>
            <h1 className="mission-title">
              {mission.titleLines.join(' ')}
            </h1>
            <div className="description-card">
              <p>{mission.description}</p>
            </div>
          </div>

          {/* Lower Stack: Glowing CTA + Bottom Segmented Dock */}
          <div className="lower-stack">
            <button
              type="button"
              id="get-started-btn"
              className="cta-glow-btn"
              onClick={handleGetStarted}
              aria-haspopup="dialog"
              aria-expanded={activeModal === 'dossier'}
              aria-controls="mission-dossier-modal"
            >
              GET STARTED
            </button>

            {/* Bottom Segmented Capsule Dock */}
            <div className="bottom-dock" role="tablist" aria-label="Select Mission">
              {DOCK_ORDER.map((key) => {
                const item = MISSIONS[key];
                const isActive = key === currentMission;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`dock-tab ${isActive ? 'is-active' : ''}`}
                    onPointerEnter={() => warmVideo(key)}
                    onFocus={() => warmVideo(key)}
                    onClick={() => handleSelectMission(key)}
                  >
                    {isActive && (
                      <span className="dock-thumb" aria-hidden="true">
                        <img
                          src={item.cutout}
                          alt=""
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </span>
                    )}
                    <span>{item.dockLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Interactive Mission Dossier & Navigation Modals */}
        {activeModal && (
          <div
            className="modal-backdrop"
            onClick={() => {
              playSfx('menu');
              setActiveModal(null);
            }}
          >
            <div
              id="mission-dossier-modal"
              role="dialog"
              aria-modal="true"
              className="modal-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div>
                  <div className="text-[11px] font-bold tracking-widest uppercase text-[#00E5FF]">
                    {activeModal === 'dossier'
                      ? mission.eyebrow
                      : `NOBOTARA71 · ${activeModal.toUpperCase()}`}
                  </div>
                  <h2 className="text-xl font-extrabold tracking-tight text-white mt-0.5">
                    {activeModal === 'dossier' &&
                      `${mission.titleLines[0]} ${mission.titleLines[1]}`}
                    {activeModal === 'purpose' && 'Educational Mission & Purpose'}
                    {activeModal === 'policy' && 'Open Space Data Policy'}
                    {activeModal === 'team' && 'Nobotara71 Flight Dynamics Team'}
                    {activeModal === 'spaceai' && 'SpaceAI Telemetry Assistant'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSfx('menu');
                    setActiveModal(null);
                  }}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {activeModal === 'dossier' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2.5">
                    {mission.telemetry.map((t) => (
                      <div
                        key={t.label}
                        className="p-3 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                          {t.label}
                        </div>
                        <div className="text-base font-extrabold font-mono text-white mt-1">
                          {t.value}
                          {t.unit && (
                            <span className="text-[11px] font-mono text-[#00E5FF] ml-1">
                              {t.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Mission Log & Milestones
                    </div>
                    {mission.highlights.map((h, i) => (
                      <p
                        key={i}
                        className="text-xs leading-relaxed text-slate-300 bg-white/5 rounded-xl p-3 border border-white/5"
                      >
                        {h}
                      </p>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    {DOCK_ORDER.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleSelectMission(k)}
                        className={`flex-1 py-2.5 px-3 rounded-full text-xs font-extrabold uppercase cursor-pointer transition-colors ${
                          k === currentMission
                            ? 'bg-[#00E5FF] text-[#030914]'
                            : 'bg-white/10 text-slate-300 hover:bg-white/15'
                        }`}
                      >
                        {MISSIONS[k].dockLabel}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeModal === 'purpose' && (
                <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                  <p>
                    <strong className="text-white">Nobotara71</strong> brings archival NASA telemetry, 4K orbital and lunar surface reconstructions, and interactive mission briefings into a unified space education interface.
                  </p>
                  <p>
                    Every mission module pairs visual horizon telemetry with verified launch, orbital, and deep-space instrumentation records.
                  </p>
                </div>
              )}

              {activeModal === 'policy' && (
                <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                  <p>
                    All orbital imagery, lunar surface film loops, and deep-space telemetry datasets follow NASA Open Data and public-domain educational archival standards.
                  </p>
                  <p>
                    Video streams are pre-warmed on demand to preserve bandwidth and respect reduced-motion accessibility settings.
                  </p>
                </div>
              )}

              {activeModal === 'team' && (
                <div className="space-y-2.5 text-sm text-slate-300">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="font-bold text-white">Astrodynamics & Visualization</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      4K Lunar, Orbital Earth, and Heliopause Simulation Pipeline
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="font-bold text-white">Nobotara71 Mission Control</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Interactive Curriculum & Telemetry Systems Engineering
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'spaceai' && (
                <div className="space-y-3">
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {spaceAiLog.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#00E5FF]/20 text-white ml-6 border border-[#00E5FF]/40'
                            : 'bg-white/5 text-slate-200 mr-4 border border-white/10'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSpaceAiSubmit} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={spaceAiPrompt}
                      onChange={(e) => setSpaceAiPrompt(e.target.value)}
                      placeholder="Ask about Apollo 11, Earth, or Voyager 1..."
                      className="flex-1 bg-white/10 border border-white/15 rounded-full px-4 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00E5FF]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-full bg-[#00E5FF] text-[#030914] text-xs font-extrabold uppercase cursor-pointer"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    {view === 'chat' && <SpaceAIChat onBack={() => setView('home')} />}
    </>
  );
}
