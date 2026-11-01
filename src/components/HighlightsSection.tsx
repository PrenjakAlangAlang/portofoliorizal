'use client';

import React from 'react';
import { Highlight } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { uiStrings, getLocalizedHighlights } from '@/lib/translations';
import ScrollReveal from './ScrollReveal';

interface HighlightsSectionProps {
  highlights: Highlight[];
}

export default function HighlightsSection({ highlights }: HighlightsSectionProps) {
  const { lang, translations, registerTexts } = useLanguage();

  React.useEffect(() => {
    const allTexts: string[] = [];
    highlights.forEach((hl) => {
      if (hl.label) allTexts.push(hl.label);
      if (hl.description) allTexts.push(hl.description);
    });
    registerTexts(allTexts);
  }, [highlights, registerTexts]);

  const locHighlights = getLocalizedHighlights(highlights, lang, translations);
  const t = uiStrings[lang].highlights;

  if (!locHighlights || locHighlights.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 pt-10 border-t border-surface-container-high" id="sorotan">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">insights</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
              {t.sectionTitle}
            </h2>
          </div>
          <span className="font-mono text-xs text-primary font-semibold flex items-center gap-1.5 bg-primary-fixed/30 border border-primary-fixed px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            {t.badge}
          </span>
        </div>
      </ScrollReveal>

      {/* Grid of Highlight Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {locHighlights.map((hl, index) => (
          <ScrollReveal
            key={hl.id}
            delay={(index % 4) * 90 + Math.floor(index / 4) * 60}
          >
            <div className="group h-full p-5 sm:p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              {/* Subtle top indicator bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="space-y-2">
                <div className="text-2xl sm:text-3xl font-extrabold text-on-surface group-hover:text-primary transition-colors tracking-tight font-mono">
                  {hl.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-on-surface leading-snug">
                  {hl.label}
                </div>
              </div>

              {hl.description && (
                <div className="pt-2 mt-2 border-t border-surface-container-high/60 text-[11px] sm:text-xs text-on-surface-variant leading-relaxed">
                  {hl.description}
                </div>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
