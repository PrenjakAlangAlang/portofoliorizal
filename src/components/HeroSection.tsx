'use client';

import React from 'react';
import { Profile } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { uiStrings, getLocalizedProfile } from '@/lib/translations';

interface HeroSectionProps {
  profile: Profile;
}

export default function HeroSection({ profile }: HeroSectionProps) {
  const { lang, translations, registerTexts } = useLanguage();

  React.useEffect(() => {
    registerTexts([
      profile.title,
      profile.bio,
      profile.education,
      profile.university,
      profile.location,
      profile.certification_badge,
      profile.quote,
    ]);
  }, [profile, registerTexts]);

  const locProfile = getLocalizedProfile(profile, lang, translations);
  const t = uiStrings[lang].hero;

  return (
    <section className="pt-6 sm:pt-10 pb-8" id="tentang">
      <div className="flex flex-col-reverse md:flex-row items-center md:items-start justify-between gap-8 md:gap-12">
        {/* Left Column: Bio & Highlights */}
        <div className="space-y-6 max-w-xl text-center md:text-left">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
              {locProfile.name}
            </h1>

            <p className="text-base sm:text-lg text-primary font-semibold tracking-wide">
              {locProfile.title}
            </p>
          </div>

          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            {locProfile.bio}
          </p>

          {/* Domain Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-on-surface-variant pt-4 border-t border-surface-container-high">
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-container-low/50">
              <span className="material-symbols-outlined text-primary text-xl">school</span>
              <span>
                <strong className="text-on-surface">{t.educationLabel}</strong> {locProfile.education}
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-container-low/50">
              <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
              <span>
                <strong className="text-on-surface">{t.universityLabel}</strong> {locProfile.university}
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-container-low/50">
              <span className="material-symbols-outlined text-primary text-xl">location_on</span>
              <span>
                <strong className="text-on-surface">{t.domicileLabel}</strong> {locProfile.location}
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-container-low/50">
              <span className="material-symbols-outlined text-primary text-xl">verified</span>
              <span>
                <strong className="text-on-surface">{t.certificationLabel}</strong> {locProfile.certification_badge}
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <a
              href="#kontak"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-base">mail</span>
              <span>{t.contactBtn}</span>
            </a>
            <a
              href="#proyek"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface text-sm font-medium transition-all active:scale-95 border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-base">work</span>
              <span>{t.portfolioBtn}</span>
            </a>
          </div>
        </div>

        {/* Right Column: Profile Picture */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-2xl overflow-hidden ring-4 ring-primary/20 shadow-xl bg-surface-container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`${locProfile.name} - Geologist`}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              src={locProfile.avatar_url}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
