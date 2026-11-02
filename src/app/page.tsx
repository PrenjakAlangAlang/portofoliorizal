import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ExperienceSection from '@/components/ExperienceSection';
import ProjectsSection from '@/components/ProjectsSection';
import CertificationsSection from '@/components/CertificationsSection';
import HighlightsSection from '@/components/HighlightsSection';
import SkillsSection from '@/components/SkillsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import {
  getProfile,
  getExperiences,
  getProjects,
  getCertifications,
  getHighlights,
  getSkills,
} from '@/lib/data-store';

// Force dynamic rendering so edits in admin dashboard reflect immediately on the live website
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [profile, experiences, projects, certifications, highlights, skills] = await Promise.all([
    getProfile(),
    getExperiences(),
    getProjects(),
    getCertifications(),
    getHighlights(),
    getSkills(),
  ]);

  return (
    <div className="min-h-screen bg-surface flex flex-col topo-bg">
      <Header profile={profile} />

      <main className="w-full pt-20 flex-grow">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 sm:space-y-16">
          <HeroSection profile={profile} />
          <SkillsSection skills={skills} />
          <ExperienceSection experiences={experiences} />
          <ProjectsSection projects={projects} />
          <CertificationsSection certifications={certifications} />
          <HighlightsSection highlights={highlights} />
          <ContactSection profile={profile} />
        </div>
      </main>

      <Footer profile={profile} />
    </div>
  );
}
