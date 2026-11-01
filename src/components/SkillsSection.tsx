'use client';

import React from 'react';
import { SkillCategory } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { uiStrings, getLocalizedSkills } from '@/lib/translations';
import ScrollReveal from './ScrollReveal';

interface SkillsSectionProps {
  skills: SkillCategory[];
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const { lang, translations, registerTexts } = useLanguage();

  React.useEffect(() => {
    const allTexts: string[] = [];
    skills.forEach((skill) => {
      if (skill.category) allTexts.push(skill.category);
      if (skill.items) allTexts.push(...skill.items);
    });
    registerTexts(allTexts);
  }, [skills, registerTexts]);

  const locSkills = getLocalizedSkills(skills, lang, translations);
  const t = uiStrings[lang].skills;

  const getIconColorClass = (iconName: string) => {
    switch (iconName) {
      case 'terrain':
        return 'text-primary';
      case 'computer':
        return 'text-secondary';
      case 'biotech':
        return 'text-on-surface';
      case 'verified_user':
        return 'text-tertiary';
      default:
        return 'text-primary';
    }
  };

  return (
    <section className="space-y-6 pt-10 border-t border-surface-container-high" id="keahlian">
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-lg">build</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {locSkills.map((skill, index) => (
          <ScrollReveal key={skill.id} delay={index * 100}>
            <div
              className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-3 hover:shadow-xs transition-shadow h-full flex flex-col justify-between"
            >
              <div>
                <div className="text-sm font-bold text-on-surface flex items-center gap-2 mb-3">
                  <span
                    className={`material-symbols-outlined text-base ${getIconColorClass(
                      skill.icon_name || 'terrain'
                    )}`}
                  >
                    {skill.icon_name || 'terrain'}
                  </span>
                  <span>{skill.category}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skill.items.map((item, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-surface-container-lowest text-xs text-on-surface font-medium border border-surface-container-high shadow-2xs hover:border-primary/40 transition-colors"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
