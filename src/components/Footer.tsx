'use client';

import React from 'react';
import Link from 'next/link';
import { Profile } from '@/lib/types';
import { getSecretAdminPath } from '@/lib/auth-constants';
import { useLanguage } from '@/context/LanguageContext';
import { uiStrings, getLocalizedProfile } from '@/lib/translations';

interface FooterProps {
  profile: Profile;
}

export default function Footer({ profile }: FooterProps) {
  const secretPath = getSecretAdminPath();
  const { lang, translations } = useLanguage();
  const locProfile = getLocalizedProfile(profile, lang, translations);
  const t = uiStrings[lang].footer;

  const linkedinUrl =
    locProfile.linkedin_url?.trim() || 'https://www.linkedin.com/in/novrijal-ramadhany';

  return (
    <footer className="w-full bg-surface-container-low border-t border-surface-container-highest mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top Tier: Quote & Geological Datum */}
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

        {/* Bottom Tier: Copyright, Socials, and Secret Admin Access */}
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
            {linkedinUrl && (
              <a
                className="hover:text-[#0A66C2] transition-colors flex items-center gap-1.5 font-mono text-xs text-on-surface-variant hover:underline"
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                LinkedIn
              </a>
            )}
            <a
              className="hover:text-primary transition-colors flex items-center gap-1.5 font-mono text-xs text-on-surface-variant hover:underline"
              href={`mailto:${locProfile.email}`}
            >
              <span className="material-symbols-outlined text-sm">mail</span>
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
