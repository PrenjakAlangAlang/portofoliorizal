import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ExperienceSection from '@/components/ExperienceSection';
import ProjectsSection from '@/components/ProjectsSection';
import CertificationsSection from '@/components/CertificationsSection';
import SkillsSection from '@/components/SkillsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import {
  getProfile,
  getExperiences,
  getProjects,
  getCertifications,
  getSkills,
} from '@/lib/data-store';

export default async function HomePage() {
  const [profile, experiences, projects, certifications, skills] = await Promise.all([
    getProfile(),
    getExperiences(),
    getProjects(),
    getCertifications(),
    getSkills(),
  ]);

  return (
    <div className="min-h-screen bg-surface flex flex-col topo-bg">
      <Header profile={profile} />

      <main className="w-full pt-20 flex-grow">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 sm:space-y-16">
          <HeroSection profile={profile} />
          <ExperienceSection experiences={experiences} />
          <ProjectsSection projects={projects} />
          <CertificationsSection certifications={certifications} />
          <SkillsSection skills={skills} />
          <ContactSection profile={profile} />
        </div>
      </main>

      <Footer profile={profile} />
    </div>
  );
}
