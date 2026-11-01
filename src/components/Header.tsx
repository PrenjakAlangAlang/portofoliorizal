'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Profile } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { uiStrings, getLocalizedProfile } from '@/lib/translations';

interface HeaderProps {
  profile: Profile;
}

export default function Header({ profile }: HeaderProps) {
  const { lang, setLang, translations } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const locProfile = getLocalizedProfile(profile, lang, translations);
  const t = uiStrings[lang].nav;

  const navLinks = [
    { href: '#tentang', label: t.about },
    { href: '#pengalaman', label: t.experience },
    { href: '#proyek', label: t.projects },
    { href: '#pelatihan', label: t.certifications },
    { href: '#sorotan', label: t.highlights },
    { href: '#keahlian', label: t.skills },
    { href: '#kontak', label: t.contact },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-b border-surface-container-highest shadow-[0_1px_8px_rgba(44,62,80,0.04)]">
      <div className="h-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
            <span className="material-symbols-outlined text-xl">terrain</span>
          </div>
          <div className="flex flex-col justify-center leading-tight">
            <span className="text-sm sm:text-base font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">
              {locProfile.name}
            </span>
            <span className="text-[11px] font-mono text-on-surface-variant flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
              {t.roleSubtitle}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-surface-container-low/80 rounded-full border border-surface-container-highest shadow-inner">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions: Theme Toggle, Lang Switcher, CV, Avatar, Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface transition-all cursor-pointer shadow-xs active:scale-95"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined text-base">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-surface-container p-0.5 rounded-full border border-outline-variant/40">
            <button
              onClick={() => setLang('id')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                lang === 'id'
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
              title="Bahasa Indonesia"
            >
              
              <span>ID</span>
            </button>
            <button
              onClick={() => setLang('en')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
              title="English"
            >
              
              <span>EN</span>
            </button>
          </div>

          {/* Download CV button */}
          <a
            href={locProfile.cv_url || '#resume'}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-container hover:bg-primary text-white text-xs font-medium transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-sm leading-none">download</span>
            <span>{t.downloadCv}</span>
          </a>

          {/* Small Avatar */}
          <div className="pl-1 border-l border-surface-container-high hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={locProfile.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
              src={locProfile.avatar_url}
            />
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-b border-surface-container-high px-6 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-on-surface hover:text-primary border-b border-surface-container-high/50"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 flex items-center justify-between gap-3">
            <a
              href={locProfile.cv_url || '#resume'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              {t.downloadCv}
            </a>

            <button
              onClick={toggleTheme}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
              <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
