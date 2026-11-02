import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Copy, Check, ExternalLink, Play, Pause, Volume2 } from 'lucide-react';
import { ConversationHistoryItem, NasaMediaBundle } from '../types/chat';
import { fetchNasaMediaForTopic } from '../services/nasaMediaService';

export const NasaLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="50" r="46" fill="#0B3D91" />
    <path
      d="M20 62 C40 25 80 18 102 38 C75 42 45 60 20 62 Z"
      fill="#FC3D21"
    />
    <path
      d="M18 52 C35 68 85 70 102 46 C75 42 35 50 18 52 Z"
      fill="#FC3D21"
    />
    <circle cx="34" cy="38" r="1.5" fill="#FFFFFF" />
    <circle cx="44" cy="68" r="1.2" fill="#FFFFFF" />
    <circle cx="86" cy="64" r="1.5" fill="#FFFFFF" />
    <circle cx="76" cy="32" r="1.8" fill="#FFFFFF" />
    <circle cx="92" cy="40" r="1.2" fill="#FFFFFF" />
    <text
      x="60"
      y="57"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="21"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="1"
    >
      NASA
    </text>
  </svg>
);

export const WikipediaLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.09 13.124l2.63-7.538h2.094l-4.14 11.232h-1.545L7.96 8.358l-3.17 8.46H3.244L7.385 5.586h2.093l2.612 7.538zm4.496-7.538l3.167 8.46h-1.544l-1.077-2.906h-3.66l-1.076 2.906h-1.545l3.66-9.76h2.075zm.77 5.765l-1.258-3.414-1.26 3.414h2.518z"/>
  </svg>
);

function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

interface ResponseViewProps {
  conversation: ConversationHistoryItem;
  onBack: () => void;
}

export const ResponseView: React.FC<ResponseViewProps> = ({
  conversation,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);
  const [media, setMedia] = useState<NasaMediaBundle | undefined>(conversation.media);
  const [visualError, setVisualError] = useState(false);

  // Minimal inline click-to-play audio state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let active = true;
    setVisualError(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (conversation.media) {
      setMedia(conversation.media);
      return;
    }

    fetchNasaMediaForTopic(conversation.question, conversation.topic).then((resolved) => {
      if (active) {
        setMedia(resolved);
      }
    });

    return () => {
      active = false;
    };
  }, [conversation]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${conversation.question}\n\n${conversation.fullAnswer}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePlayAudio = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * duration;
    setCurrentTime(el.currentTime);
  };

  const fallbackTopic = conversation.topic || conversation.question.replace(/[?.,]/g, '').trim();
  const nasaUrl = conversation.nasaUrl || `https://science.nasa.gov/?search=${encodeURIComponent(fallbackTopic)}`;
  const wikipediaUrl = conversation.wikipediaUrl || `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(fallbackTopic)}`;

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-0 mt-2 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-[13px] font-medium text-[#94A3B8] hover:text-[#F8FAFC] flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-white/[0.035] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.15] backdrop-blur-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Return to SpaceAI</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] p-2 rounded-lg bg-white/[0.035] hover:bg-white/[0.07] border border-white/[0.08] transition-all cursor-pointer"
            title="Copy Analysis"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#38BDF8]" /> : <Copy className="w-3.5 h-3.5 text-[#CBD5E1]" />}
          </button>
          <span className="text-[12px] font-mono tabular-nums text-[#64748B]">{conversation.time}</span>
        </div>
      </div>

      <div className="rounded-[16px] bg-white/[0.035] backdrop-blur-2xl border border-white/[0.08] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="mb-5 pb-4 border-b border-white/[0.06]">
          <span className="text-[11px] font-semibold text-[#38BDF8] uppercase tracking-[0.06em] block mb-1.5">
            Celestial Inquiry Analyzed
          </span>
          <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#F8FAFC] tracking-tight leading-snug">
            {conversation.question}
          </h2>
        </div>

        {/* Sources Section with authentic NASA and Wikipedia buttons */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5 py-2.5 px-3.5 rounded-xl bg-white/[0.025] border border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] uppercase font-semibold text-[#94A3B8] tracking-[0.06em]">
              Verified Sources
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={nasaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B3D91]/25 hover:bg-[#0B3D91]/40 border border-[#38BDF8]/25 hover:border-[#38BDF8]/50 text-[#F8FAFC] text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 group"
              title={`Read official NASA documentation on ${fallbackTopic}`}
            >
              <NasaLogo className="w-4 h-4 shrink-0" />
              <span>NASA</span>
              <ExternalLink className="w-3 h-3 text-[#38BDF8] opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>

            <a
              href={wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.2] text-[#F8FAFC] text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 group"
              title={`Read Wikipedia article on ${fallbackTopic}`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                <WikipediaLogo className="w-2.5 h-2.5 text-black" />
              </div>
              <span>Wikipedia</span>
              <ExternalLink className="w-3 h-3 text-[#94A3B8] opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>
          </div>
        </div>

        <div className="text-[14.5px] text-[#E2E8F0] leading-[1.65] space-y-3 mb-6 whitespace-pre-line">
          {conversation.fullAnswer}
        </div>

        {/* Inline NASA Featured Visual */}
        {media?.visual && !visualError && (
          <div className="mb-5 rounded-xl bg-[#070A12]/80 border border-white/[0.08] overflow-hidden">
            <div className="relative bg-black/80 flex items-center justify-center max-h-[340px] overflow-hidden">
              {media.visual.type === 'video' ? (
                <video
                  src={media.visual.url}
                  poster={media.visual.previewUrl}
                  controls
                  playsInline
                  preload="metadata"
                  onError={() => setVisualError(true)}
                  className="w-full max-h-[340px] object-cover"
                />
              ) : (
                <img
                  src={media.visual.url}
                  alt={media.visual.title}
                  loading="lazy"
                  onError={() => setVisualError(true)}
                  className="w-full max-h-[340px] object-cover"
                />
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#E2E8F0] truncate">
                  {media.visual.title}
                </p>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-[#64748B] shrink-0">
                {[media.visual.center || 'NASA', media.visual.dateCreated, `ID: ${media.visual.nasaId}`]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </div>
          </div>
        )}

        {/* Inline Minimal Click-to-Play Space Audio Player */}
        {media?.audio && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-white/[0.025] border border-white/[0.08] flex items-center gap-3.5">
            <audio
              ref={audioRef}
              src={media.audio.audioUrl}
              preload="metadata"
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
              onEnded={() => {
                setIsPlaying(false);
                setCurrentTime(0);
              }}
            />

            <button
              type="button"
              onClick={togglePlayAudio}
              aria-label={isPlaying ? 'Pause NASA Space Audio' : 'Play NASA Space Audio'}
              className="w-9 h-9 rounded-lg bg-[#2563EB]/20 hover:bg-[#2563EB]/35 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] transition-colors cursor-pointer shrink-0 active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Volume2 className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                  <span className="text-xs font-medium text-[#F8FAFC] truncate">
                    {media.audio.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-[#94A3B8] shrink-0">
                  {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
                </span>
              </div>

              <div
                onClick={handleSeek}
                className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden cursor-pointer relative"
                title="Click to seek audio"
              >
                <div
                  className="h-full bg-[#38BDF8] transition-all duration-100 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {conversation.metrics && conversation.metrics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {conversation.metrics.map((m, i) => (
              <div
                key={i}
                className="px-4 py-3.5 rounded-xl bg-white/[0.025] border border-white/[0.08] flex flex-col justify-between gap-1 hover:border-white/[0.15] transition-all"
              >
                <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-[0.05em] leading-tight">
                  {m.label}
                </span>
                <div className="flex items-baseline justify-between gap-2 flex-wrap pt-0.5">
                  <span className="text-[15px] font-semibold text-[#F8FAFC] font-mono tabular-nums leading-snug">
                    {m.value}
                  </span>
                  {m.delta && (
                    <span className="text-[11px] font-mono font-medium text-[#38BDF8]">
                      {m.delta}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

