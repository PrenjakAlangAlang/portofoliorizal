'use client';

import React, { useState } from 'react';
import { Profile } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { uiStrings, getLocalizedProfile } from '@/lib/translations';
import ScrollReveal from './ScrollReveal';

interface ContactSectionProps {
  profile: Profile;
}

export default function ContactSection({ profile }: ContactSectionProps) {
  const { lang, translations } = useLanguage();
  const locProfile = getLocalizedProfile(profile, lang, translations);
  const t = uiStrings[lang].contact;

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: t.successMsg,
        });
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        const errorData = await res.json();
        setStatusMessage({
          type: 'error',
          text: errorData.error || t.errorMsg,
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: t.errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-8 pt-10 border-t border-surface-container-high" id="kontak">
      <ScrollReveal>
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">connect_without_contact</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
              {t.sectionTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl">
            {t.sectionSubtitle}
          </p>
        </div>
      </ScrollReveal>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Direct Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Email */}
          <ScrollReveal delay={0}>
            <a
              className="group p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col items-center text-center space-y-3 transition-all hover:border-primary/50 hover:shadow-md h-full"
              href={`mailto:${locProfile.email}`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary-fixed/50 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-xl">mail</span>
              </div>
              <div className="space-y-1 w-full">
                <span className="block text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
                  {t.emailLabel}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-on-surface group-hover:text-primary transition-colors block break-all">
                  {locProfile.email}
                </span>
              </div>
            </a>
          </ScrollReveal>

          {/* WhatsApp */}
          <ScrollReveal delay={120}>
            <a
              className="group p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col items-center text-center space-y-3 transition-all hover:border-primary/50 hover:shadow-md h-full"
              href={`https://wa.me/${locProfile.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-fixed/50 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined text-xl">chat</span>
              </div>
              <div className="space-y-1 w-full">
                <span className="block text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
                  {t.waLabel}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-on-surface group-hover:text-primary transition-colors block">
                  {locProfile.phone}
                </span>
              </div>
            </a>
          </ScrollReveal>

          {/* Domisili */}
          <ScrollReveal delay={240}>
            <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high flex flex-col items-center text-center space-y-3 shadow-xs h-full">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed/50 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">location_on</span>
              </div>
              <div className="space-y-1 w-full">
                <span className="block text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
                  {t.domicileLabel}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-on-surface block">
                  {locProfile.location}
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Interactive Send Message Form */}
        <ScrollReveal delay={150}>
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-5">
          <div className="border-b border-surface-container-high pb-4">
            <h3 className="text-base sm:text-lg font-bold text-on-surface">
              {t.formTitle}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {t.formSubtitle}
            </p>
          </div>

          {statusMessage && (
            <div
              className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-tertiary-fixed/30 text-tertiary border border-tertiary-fixed'
                  : 'bg-error-container/40 text-error border border-error-container'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {statusMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-on-surface">
                  {t.nameLabel} <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.namePlaceholder}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 bg-surface focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-on-surface">
                  Email <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 bg-surface focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-on-surface">
                  {t.phoneLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.phonePlaceholder}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 bg-surface focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-on-surface">
                  {t.subjectLabel} <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.subjectPlaceholder}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 bg-surface focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-on-surface">
                {t.messageLabel} <span className="text-error">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder={t.messagePlaceholder}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 bg-surface focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm transition-all resize-y"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">send</span>
              <span>{isSubmitting ? t.sendingBtn : t.sendBtn}</span>
            </button>
          </form>
        </div>
      </ScrollReveal>

      {/* Download CV CTA */}
      <ScrollReveal delay={200}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary-container hover:bg-primary text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95"
            href={locProfile.cv_url || '#resume'}
            id="resume-download"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>{t.downloadCvBtn}</span>
          </a>
        </div>
      </ScrollReveal>
      </div>
    </section>
  );
}
