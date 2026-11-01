'use client';

import React from 'react';
import Link from 'next/link';
import { Profile } from '@/lib/types';
import { getSecretAdminPath } from '@/lib/auth-constants';
import { useLanguage } from '@/context/LanguageContext';
import { uiStrings, getLocalizedProfile } from '@/lib/translations';
import ScrollReveal from './ScrollReveal';

interface FooterProps {
  profile: Profile;
}

export default function Footer({ profile }: FooterProps) {
  const secretPath = getSecretAdminPath();
  const { lang, translations } = useLanguage();
  const locProfile = getLocalizedProfile(profile, lang, translations);
  const t = uiStrings[lang].footer;

  return (
    <footer className="w-full bg-surface-container-low border-t border-surface-container-highest mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top Tier: Quote & Geological Datum */}
        <ScrollReveal direction="up" delay={50}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-surface-container-highest pb-8">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">terrain</span>
                <span className="text-base sm:text-lg font-bold text-on-surface">
                  {locProfile.name}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant italic max-w-xl">
                {locProfile.quote}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-1.5">
              <span className="font-mono text-[11px] text-on-surface-variant">
                {t.role}
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom Tier: Copyright, Socials, and Secret Admin Access */}
        <ScrollReveal direction="up" delay={120}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span suppressHydrationWarning>
                &copy; {new Date().getFullYear()} {locProfile.name}. {t.copyright}
              </span>
              {/* Discreet portal link for the administrator */}
              <Link
                href={secretPath}
                className="opacity-20 hover:opacity-100 transition-opacity text-[10px] font-mono text-outline"
                title="Portal Khusus"
              >
                [•]
              </Link>
            </div>

            <div className="flex items-center gap-5 flex-wrap">
              {locProfile.linkedin_url && (
                <a
                  className="hover:text-primary transition-colors flex items-center gap-1 font-mono text-xs"
                  href={locProfile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  LinkedIn
                </a>
              )}
              <a
                className="hover:text-primary transition-colors flex items-center gap-1 font-mono text-xs"
                href={`mailto:${locProfile.email}`}
              >
                <span className="material-symbols-outlined text-sm">mail</span>
                Email
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
