'use client';

import React from 'react';
import { Certification } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { uiStrings, getLocalizedCertifications } from '@/lib/translations';
import ScrollReveal from './ScrollReveal';

interface CertificationsSectionProps {
  certifications: Certification[];
}

export default function CertificationsSection({ certifications }: CertificationsSectionProps) {
  const { lang, translations, registerTexts } = useLanguage();

  React.useEffect(() => {
    const allTexts: string[] = [];
    certifications.forEach((cert) => {
      if (cert.title) allTexts.push(cert.title);
      if (cert.description) allTexts.push(cert.description);
    });
    registerTexts(allTexts);
  }, [certifications, registerTexts]);

  const locCerts = getLocalizedCertifications(certifications, lang, translations);
  const t = uiStrings[lang].certifications;

  return (
    <section className="space-y-6 pt-10 border-t border-surface-container-high" id="pelatihan">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">workspace_premium</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
              {t.sectionTitle}
            </h2>
          </div>
          <span className="font-mono text-xs text-tertiary font-semibold flex items-center gap-1.5 bg-tertiary-fixed/30 border border-tertiary-fixed px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            {t.badge}
          </span>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locCerts.map((cert, index) => (
          <ScrollReveal key={cert.id} delay={(index % 3) * 110 + Math.floor(index / 3) * 60}>
            <div
              className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high space-y-2 transition-all hover:border-tertiary/50 hover:shadow-sm group flex flex-col justify-between h-full"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant">
                  <span className="font-semibold text-secondary">{cert.issuer}</span>
                  <span className="text-primary font-bold">{cert.year}</span>
                </div>

                <div className="text-sm font-bold text-on-surface group-hover:text-tertiary transition-colors leading-snug">
                  {cert.title}
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {cert.description}
                </p>
              </div>

              {cert.credential_url && cert.credential_url !== '#' && (
                <a
                  href={cert.credential_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline pt-2 border-t border-surface-container-high/40"
                >
                  <span>{t.viewCredential}</span>
                  <span className="material-symbols-outlined text-xs">arrow_outward</span>
                </a>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
