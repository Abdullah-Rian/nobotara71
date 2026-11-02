import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  ChevronDown, 
  Mic, 
  ArrowUp, 
  FileText, 
  Image as ImageIcon, 
  SlidersHorizontal, 
  X, 
  Check, 
  File
} from 'lucide-react';

export type ComposerMode = 'Normal' | 'Brief' | 'Deep Analysis';
export type DeepThinkMode = 'Deep Think' | 'Tax Strategist' | 'Portfolio Rebalance' | 'Analytical Logic';

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: 'document' | 'image';
  previewUrl?: string;
}

export const HOT_SPACE_TOPIC_FAQS: string[] = [
  "How does Europa Clipper scan through the icy crust of Europa?",
  "Why is NASA targeting the lunar South Pole for Artemis water ice extraction?",
  "How does JWST peer back 13.5 billion years to witness the earliest galaxies form?",
  "Did the Perseverance rover discover potential biosignatures in Jezero Crater's delta?",
  "What happens at the event horizon and photon sphere of a supermassive black hole?",
  "How do interstellar objects like 3I/ATLAS and 'Oumuamua enter our solar system?",
  "What is NASA's plan to safely deorbit the International Space Station in 2030?",
  "How do coronal mass ejections trigger severe geomagnetic superstorms on Earth?",
  "How do astronomers detect gravitational waves from colliding binary neutron stars?",
  "What will the Nancy Grace Roman Space Telescope reveal about dark matter?"
];

interface ComposerProps {
  onSendMessage: (text: string, mode: ComposerMode, attachments: AttachedFile[]) => void;
  onOpenPersonalize: () => void;
  isLoading?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  onOpenPersonalize,
  isLoading = false,
}) => {
  const [input, setInput] = useState('');
  const [faqIndex, setFaqIndex] = useState(0);
  const [selectedMode, setSelectedMode] = useState<ComposerMode>('Normal');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);

  const modeRef = useRef<HTMLDivElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) {
        setShowModeDropdown(false);
      }
      if (attachRef.current && !attachRef.current.contains(e.target as Node)) {
        setShowAttachmentMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryToSend = input.trim() || (attachments.length === 0 ? HOT_SPACE_TOPIC_FAQS[faqIndex] : '');
    if ((!queryToSend && attachments.length === 0) || isLoading) return;
    onSendMessage(queryToSend, selectedMode, attachments);
    setInput('');
    setAttachments([]);
    setFaqIndex((prev) => (prev + 1) % HOT_SPACE_TOPIC_FAQS.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !input.trim() && !isVoiceActive) {
      e.preventDefault();
      setInput(HOT_SPACE_TOPIC_FAQS[faqIndex]);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
      setAttachments((prev) => [
        ...prev,
        {
          id: `file-${Date.now()}`,
          name: file.name,
          size: sizeStr,
          type: 'document',
        },
      ]);
      setShowAttachmentMenu(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      const sizeStr = `${Math.round(file.size / 1024)} KB`;
      setAttachments((prev) => [
        ...prev,
        {
          id: `img-${Date.now()}`,
          name: file.name,
          size: sizeStr,
          type: 'image',
          previewUrl,
        },
      ]);
      setShowAttachmentMenu(false);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleVoice = () => {
    if (!isVoiceActive) {
      setIsVoiceActive(true);
      const randomQuery = HOT_SPACE_TOPIC_FAQS[Math.floor(Math.random() * HOT_SPACE_TOPIC_FAQS.length)];
      setTimeout(() => {
        setInput(randomQuery);
        setIsVoiceActive(false);
      }, 2200);
    } else {
      setIsVoiceActive(false);
    }
  };

  const modes: ComposerMode[] = [
    'Normal',
    'Brief',
    'Deep Analysis',
  ];

  return (
    <div className="w-full max-w-[540px] mx-auto px-2 sm:px-0">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.csv,.txt,.docx,.json,.md"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Render Attached Chips above Composer */}
      {attachments.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-[#F8FAFC] backdrop-blur-md"
            >
              {att.type === 'image' && att.previewUrl ? (
                <img
                  src={att.previewUrl}
                  alt={att.name}
                  className="w-5 h-5 rounded object-cover"
                />
              ) : (
                <File className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              )}
              <span className="font-medium truncate max-w-[160px]">{att.name}</span>
              <span className="text-[10px] text-[#94A3B8] font-mono tabular-nums">({att.size})</span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors ml-0.5 cursor-pointer"
                title="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Floating Elevated Glass Card Composer with AI Studio Orbiting Border Lighting */}
      <form
        onSubmit={handleSubmit}
        id="space-composer"
        className="glass-composer relative flex flex-col justify-between p-5 min-h-[158px] md:p-4 md:min-h-[138px]"
      >
        {/* Layer 1: Diffused Orbital Aura (Cosmic Cyan, Royal Blue & Indigo) */}
        <div aria-hidden="true" className="ai-studio-border-glow-wrap">
          <div className="ai-studio-border-glow" />
        </div>

        {/* Layer 2: Crisp 1.5px Masked Orbiting Border Beam */}
        <div aria-hidden="true" className="ai-studio-border-ring" />

        {/* Top: Multi-line Input Area */}
        <div className="relative z-10 w-full flex items-start pt-0.5 pb-3 md:pb-2">
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isVoiceActive
                ? 'Listening to voice telemetry...'
                : HOT_SPACE_TOPIC_FAQS[faqIndex]
            }
            title="Press Tab or Enter to explore this topic, or type your own question"
            className="w-full resize-none bg-transparent text-[#F8FAFC] placeholder-[#CBD5E1]/75 text-[16px] leading-[1.45] focus:outline-none tracking-normal font-normal px-0.5 selection:bg-[#38BDF8]/25 transition-colors duration-200"
          />
        </div>

        {/* Bottom Action Toolbar (All 4 controls aligned to exact same vertical baseline & 34px height) */}
        <div className="relative z-10 flex items-center justify-between pt-2 md:pt-1.5 select-none">
          {/* Left Group: [+] Attachment & [ Normal ▾ ] Mode Pill */}
          <div className="flex items-center gap-2.5">
            {/* '+' Attachment Context Popover */}
            <div className="relative flex items-center" ref={attachRef}>
              <button
                type="button"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                title="Add Mission Telemetry & Context"
                className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center text-[#E2E8F0] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.14] transition-all duration-150 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2]" />
              </button>

              {showAttachmentMenu && (
                <div className="absolute left-0 bottom-11 z-50 w-56 rounded-xl bg-[#0B1120]/95 border border-white/[0.1] shadow-2xl p-1.5 text-xs text-[#F8FAFC] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-2.5 text-left p-2 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8] shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-[#F8FAFC] text-[13px]">Files</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full flex items-center gap-2.5 text-left p-2 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-[#F8FAFC] text-[13px]">Images</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachmentMenu(false);
                      onOpenPersonalize();
                    }}
                    className="w-full flex items-center gap-2.5 text-left p-2 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-[#F8FAFC] text-[13px]">Personalize Chat</span>
                  </button>
                </div>
              )}
            </div>

            {/* '[ Normal ▾ ]' Mode Selector Pill */}
            <div className="relative flex items-center" ref={modeRef}>
              <button
                type="button"
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className="h-[34px] px-3.5 rounded-[8px] flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#E2E8F0] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.14] transition-all duration-150 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <span>{selectedMode}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>

              {showModeDropdown && (
                <div className="absolute left-0 bottom-11 z-50 w-44 rounded-xl bg-[#0B1120]/95 border border-white/[0.1] shadow-2xl p-1.5 text-xs text-[#F8FAFC] backdrop-blur-xl">
                  <div className="px-2.5 py-1 font-medium text-[#64748B] text-[10px] uppercase tracking-wider">
                    Response Mode
                  </div>
                  {modes.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setSelectedMode(mode);
                        setShowModeDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left cursor-pointer text-[13px] ${
                        selectedMode === mode
                          ? 'bg-[#38BDF8]/15 text-[#38BDF8] font-medium'
                          : 'hover:bg-white/[0.06] text-[#CBD5E1]'
                      }`}
                    >
                      <span>{mode}</span>
                      {selectedMode === mode && <Check className="w-3.5 h-3.5 text-[#38BDF8]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Group: Voice Dictation Mic Button & Send Button [ ↑ ] */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleVoice}
              title={isVoiceActive ? 'Listening... click to stop' : 'Voice Dictation'}
              className={`w-[34px] h-[34px] rounded-[8px] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ${
                isVoiceActive
                  ? 'bg-[#2563EB] text-white shadow-[0_0_16px_rgba(56,189,248,0.55)] animate-pulse'
                  : 'text-[#E2E8F0] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.14]'
              }`}
            >
              <Mic className={`w-4 h-4 ${isVoiceActive ? 'text-white' : 'text-[#CBD5E1]'}`} />
            </button>

            {/* Primary Royal Blue Send Button (#2563EB) */}
            <button
              type="submit"
              disabled={isLoading}
              title="Send Inquiry"
              className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center text-white bg-gradient-to-b from-[#3B82F6] to-[#2563EB] hover:from-[#60A5FA] hover:to-[#1D4ED8] border border-[#60A5FA]/50 shadow-[0_0_18px_rgba(37,99,235,0.65)] hover:shadow-[0_0_24px_rgba(56,189,248,0.75)] transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/25 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4 stroke-[2.25]" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
