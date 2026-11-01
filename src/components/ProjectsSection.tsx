'use client';

import React from 'react';
import { Project } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { uiStrings, getLocalizedProjects } from '@/lib/translations';

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const { lang, translations, registerTexts } = useLanguage();

  React.useEffect(() => {
    const allTexts: string[] = [];
    projects.forEach((proj) => {
      if (proj.title) allTexts.push(proj.title);
      if (proj.description) allTexts.push(proj.description);
      if (proj.deliverable) allTexts.push(proj.deliverable);
      if (proj.location) allTexts.push(proj.location);
      if (proj.duration) allTexts.push(proj.duration);
      if (proj.tags) allTexts.push(...proj.tags);
    });
    registerTexts(allTexts);
  }, [projects, registerTexts]);

  const locProjects = getLocalizedProjects(projects, lang, translations);
  const t = uiStrings[lang].projects;

  const getDeliverableColorClass = (color?: string) => {
    switch (color) {
      case 'secondary':
        return 'text-secondary bg-secondary-container/40 border-secondary-container';
      case 'tertiary':
        return 'text-tertiary bg-tertiary-container/20 border-tertiary-container';
      case 'error':
        return 'text-error bg-error-container/40 border-error-container';
      case 'primary':
      default:
        return 'text-primary bg-primary-fixed/40 border-primary-fixed';
    }
  };

  return (
    <section className="space-y-6 pt-10 border-t border-surface-container-high" id="proyek">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">explore</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
            {t.sectionTitle}
          </h2>
        </div>
        <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider bg-surface-container px-3 py-1 rounded-full border border-surface-container-high">
          {t.badge}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locProjects.map((proj) => (
          <div
            key={proj.id}
            className="rounded-xl bg-surface-container-lowest border border-surface-container-high overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between hover:border-primary/40 group"
          >
            {/* Image Preview with Hover Zoom */}
            <div className="relative aspect-[16/9] w-full bg-surface-container overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={proj.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={proj.image_url}
              />
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-black/60 backdrop-blur-xs text-[11px] font-mono text-white font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">schedule</span>
                <span>{proj.duration}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant">
                  <span className="flex items-center gap-1 text-primary">
                    <span className="material-symbols-outlined text-sm">pin_drop</span>
                    {proj.location}
                  </span>
                  <span>{proj.duration}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                  {proj.title}
                </h3>

                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {proj.description}
                </p>
              </div>

              {/* Tags & Deliverable */}
              <div className="pt-3 space-y-2 border-t border-surface-container-high/50">
                {proj.tags && proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {proj.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-container-high text-on-surface"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className={`text-xs font-mono font-medium px-2.5 py-1.5 rounded-lg border ${getDeliverableColorClass(
                    proj.deliverable_color
                  )} flex items-center gap-1.5`}
                >
                  <span className="material-symbols-outlined text-sm">task_alt</span>
                  <span className="truncate">{t.deliverableLabel}: {proj.deliverable}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
