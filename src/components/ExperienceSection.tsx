'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Experience, parseResponsibilities } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { uiStrings, getLocalizedExperiences } from '@/lib/translations';
import ScrollReveal from './ScrollReveal';

const ExperiencePresentationModal = dynamic(
  () => import('./ExperiencePresentationModal'),
  { ssr: false }
);

interface ExperienceSectionProps {
  experiences: Experience[];
}

export default function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const { lang, translations, registerTexts } = useLanguage();
  const [activeExperience, setActiveExperience] = useState<Experience | null>(null);

  React.useEffect(() => {
    const allTexts: string[] = [];
    experiences.forEach((exp) => {
      if (exp.title) allTexts.push(exp.title);
      if (exp.description) allTexts.push(exp.description);
      if (exp.location) allTexts.push(exp.location);
      if (exp.period) allTexts.push(exp.period);
      if (exp.tags) allTexts.push(...exp.tags);
      if (exp.skills) allTexts.push(...exp.skills);
      if (exp.responsibilities) allTexts.push(...exp.responsibilities);
    });
    registerTexts(allTexts);
  }, [experiences, registerTexts]);

  const locExperiences = getLocalizedExperiences(experiences, lang, translations);
  const t = uiStrings[lang].experience;

  return (
    <section className="space-y-6 pt-10 border-t border-surface-container-high" id="pengalaman">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">history_edu</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
              {t.sectionTitle}
            </h2>
          </div>
          <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider bg-surface-container px-3 py-1 rounded-full border border-surface-container-high">
            {t.badge}
          </span>
        </div>
      </ScrollReveal>

      <div className="space-y-4">
        {locExperiences.map((exp, index) => (
          <ScrollReveal key={exp.id} delay={index * 130}>
            <div
              className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high space-y-3 transition-all hover:border-primary/40 hover:shadow-md group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-base sm:text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                  {exp.title}
                </h3>
                <span className="font-mono text-xs text-primary font-semibold bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20 self-start sm:self-auto">
                  {exp.period}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-primary font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">business</span>
                <span>{exp.company}</span>
                <span className="text-outline-variant">•</span>
                <span className="text-on-surface-variant">{exp.location}</span>
              </div>

              {/* Uraian Tanggung Jawab (1 poin per baris) */}
              {(() => {
                const points = parseResponsibilities(exp.description, exp.responsibilities);
                if (
                  points.length <= 1 &&
                  !exp.description?.includes('•') &&
                  !exp.description?.includes('\n')
                ) {
                  return (
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      {points[0] || exp.description}
                    </p>
                  );
                }
                return (
                  <ul className="space-y-1.5 pt-0.5">
                    {points.map((pt, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs sm:text-sm text-on-surface-variant leading-relaxed"
                      >
                        <span className="text-primary font-bold select-none text-base leading-none mt-0.5 shrink-0">
                          &bull;
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                );
              })()}

              {exp.tags && exp.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {exp.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded bg-surface-container-high text-on-surface font-mono text-[11px] font-medium border border-outline-variant/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Tombol Lihat Proyek (sesuai tombol di Proyek & Kredensial) */}
              <div className="pt-2.5 border-t border-surface-container-high/40">
                <button
                  type="button"
                  onClick={() => setActiveExperience(exp)}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-primary hover:underline cursor-pointer group/link"
                >
                  <span>{t.viewProject || 'Lihat Proyek'}</span>
                  <span className="material-symbols-outlined text-xs transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">
                    arrow_outward
                  </span>
                </button>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Modal Paparan / Slide Viewer Pengalaman Kerja */}
      {activeExperience && (
        <ExperiencePresentationModal
          experience={activeExperience}
          onClose={() => setActiveExperience(null)}
        />
      )}
    </section>
  );
}
