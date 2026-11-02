/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { OrbVisualizer } from '../components/OrbVisualizer';
import { Composer, AttachedFile, ComposerMode } from '../components/Composer';
import { RecentConversations } from '../components/RecentConversations';
import { ResponseView } from '../components/ResponseView';
import { PersonalizeDrawer, PersonalizationConfig, defaultPersonalization } from '../components/PersonalizeDrawer';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import { ConversationHistoryItem } from '../types/chat';
import { generateAIResponse } from '../services/aiAdvisor';
import { ConstellationBackground } from '../components/ConstellationBackground';
import { MissionAlerts } from '../components/MissionAlerts';

interface SpaceAiPageProps {
  onBack: () => void;
}

export function SpaceAiPage({ onBack }: SpaceAiPageProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [replayKey] = useState(0);
  const [activeConversation, setActiveConversation] = useState<ConversationHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);

  // Load personalization from localStorage or default
  const [personalization, setPersonalization] = useState<PersonalizationConfig>(() => {
    try {
      const saved = localStorage.getItem('aura_personalization');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return defaultPersonalization;
  });

  const handleSavePersonalization = (newConfig: PersonalizationConfig) => {
    setPersonalization(newConfig);
    try {
      localStorage.setItem('aura_personalization', JSON.stringify(newConfig));
    } catch {
      // Fallback
    }
  };

  // Check prefers-reduced-motion media query
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setReducedMotion(true);
    }
    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Web Animations entrance timeline
  useEntranceAnimation({
    reducedMotion,
    replayKey,
  });

  const handleBack = () => {
    if (activeConversation) {
      setActiveConversation(null);
      return;
    }
    onBack();
  };

  const handleSendMessage = async (
    text: string,
    mode: ComposerMode = 'Normal',
    attachments: AttachedFile[] = []
  ) => {
    setIsLoading(true);
    try {
      const response = await generateAIResponse(text, mode, attachments, personalization);
      setActiveConversation(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-[#F8FAFC] relative flex flex-col overflow-x-hidden selection:bg-[#38BDF8]/25 selection:text-sky-100 animate-in fade-in duration-300">
      {/* Deep Space Nebula & Starfield Atmosphere */}
      <ConstellationBackground reducedMotion={reducedMotion} />

      {/* Top Navigation Bar */}
      <header className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 pt-6 pb-2 md:pt-4 md:pb-0 flex items-center justify-between relative z-10">
        <button
          type="button"
          onClick={handleBack}
          className="back-btn group inline-flex items-center gap-2 px-4 py-1.5 h-[36px] text-[13px] font-medium text-[#E2E8F0] hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.16] hover:border-[#00E5FF]/40 rounded-full backdrop-blur-md transition-all duration-200 active:scale-95 cursor-pointer select-none shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          title={activeConversation ? 'Back to queries' : 'Back to Nobotara71 Missions'}
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#00E5FF] group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
          <span>{activeConversation ? 'Overview' : 'Missions'}</span>
        </button>

        <div className="flex items-center gap-4 select-none ml-auto">
          {!activeConversation && (
            <MissionAlerts onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
          )}

          {/* Brand Lockup with Ringed Planet Icon + SpaceAI */}
          <div className="inline-flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#38BDF8] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="5.5"
                className="stroke-[#60A5FA]"
                strokeWidth="1.6"
              />
              <ellipse
                cx="12"
                cy="12"
                rx="10.5"
                ry="3.6"
                transform="rotate(-24 12 12)"
                className="stroke-[#38BDF8]"
                strokeWidth="1.5"
              />
            </svg>
            <span className="text-[16px] font-semibold tracking-tight text-[#F8FAFC] whitespace-nowrap">
              Space<span className="text-[#60A5FA] font-medium">AI</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 min-w-0 flex flex-col w-full">
        <main className="flex-1 flex flex-col items-center justify-center pt-2 pb-8 md:justify-start md:pt-0 md:pb-4 px-4 relative z-10">
          {/* Active Conversation Detail View */}
          {activeConversation ? (
            <ResponseView
              conversation={activeConversation}
              onBack={() => setActiveConversation(null)}
            />
          ) : (
            <div className="w-full flex flex-col items-center md:gap-y-4 md:-mt-3">
              {/* Hero Ringed Cosmic Energy Orb (80% Scale) */}
              <div className="mb-2 md:mb-0 flex justify-center">
                <OrbVisualizer reducedMotion={reducedMotion} />
              </div>

              {/* Hero Subtitle & Balanced Gradient Headline */}
              <div className="text-center mb-7 md:mb-0 select-none max-w-2xl mx-auto px-2">
                <p
                  id="entrance-greeting"
                  className="text-[#94A3B8] font-medium text-[15px] tracking-[0.02em] mb-2 md:mb-1"
                >
                  Good Morning, Commander
                </p>
                <h1
                  className="text-[30px] sm:text-[38px] md:text-[36px] font-semibold tracking-[-0.02em] leading-[1.18] bg-gradient-to-b from-[#FFFFFF] to-[#CBD5E1] bg-clip-text text-transparent"
                  style={{ textWrap: 'balance' }}
                >
                  What would you like to explore?
                </h1>
              </div>

              {/* Elevated Glassmorphic Prompt Input (Centerpiece Component) */}
              <Composer
                onSendMessage={handleSendMessage}
                onOpenPersonalize={() => setIsPersonalizeOpen(true)}
                isLoading={isLoading}
              />

              {/* Recent Query Pills */}
              <div id="entrance-history" className="w-full">
                <RecentConversations
                  onSelectConversation={(item) => setActiveConversation(item)}
                  activeId={activeConversation ? (activeConversation as ConversationHistoryItem).id : null}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Personalize Chat Slide-Over Drawer */}
      <PersonalizeDrawer
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        config={personalization}
        onSave={handleSavePersonalization}
      />
    </div>
  );
}
