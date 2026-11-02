import { Language } from '@/context/LanguageContext';
import { Profile, Experience, Project, Certification, SkillCategory, Highlight } from './types';
import { defaultDictionaryEN } from './translations-dictionary';

// Static UI Dictionaries (Navigation, static buttons, fixed labels)
export const uiStrings = {
  id: {
    nav: {
      about: 'Tentang Saya',
      experience: 'Pengalaman',
      projects: 'Proyek',
      certifications: 'Pelatihan & Sertifikasi',
      highlights: 'Pencapaian',
      skills: 'Keahlian',
      contact: 'Kontak',
      downloadCv: 'Unduh CV',
      roleSubtitle: 'Teknik Geologi',
    },
    hero: {
      educationLabel: 'Pendidikan:',
      universityLabel: 'Universitas:',
      domicileLabel: 'Domisili:',
      certificationLabel: 'IPK:',
      contactBtn: 'Hubungi Saya',
      portfolioBtn: 'Lihat Portofolio',
    },
    experience: {
      sectionTitle: 'Pengalaman Kerja',
      badge: 'Riwayat Karir',
      viewProject: 'Lihat Proyek',
    },
    projects: {
      sectionTitle: 'Portofolio Proyek',
      badge: 'Pilihan Utama',
      deliverableLabel: 'Deliverable',
      viewProject: 'Lihat Proyek',
    },
    certifications: {
      sectionTitle: 'Sertifikasi & Pelatihan',
      badge: 'Terverifikasi',
      viewCredential: 'Lihat Kredensial',
    },
    highlights: {
      sectionTitle: 'Pencapaian & Sorotan',
      badge: 'Metrik Eksplorasi',
    },
    skills: {
      sectionTitle: 'Keahlian Teknis',
      badge: 'Kompetensi Kunci',
    },
    contact: {
      sectionTitle: 'Hubungi Saya',
      sectionSubtitle:
        'Terbuka untuk konsultasi eksplorasi mineral, pemetaan geologi lapangan, proyek pemodelan 3D, atau kolaborasi penelitian geologi.',
      emailLabel: 'Email',
      waLabel: 'WhatsApp / Kontak',
      domicileLabel: 'Domisili Operasional',
      formTitle: 'Kirim Pesan Langsung',
      formSubtitle:
        'Isi formulir di bawah ini untuk mengirim pertanyaan atau penawaran kerja sama.',
      namePlaceholder: 'Contoh: Ir. Budi Santoso',
      emailPlaceholder: 'nama@perusahaan.co.id',
      phonePlaceholder: '+62 81...',
      subjectPlaceholder: 'Eksplorasi Proyek / Penawaran Konsultansi',
      messagePlaceholder: 'Tuliskan rincian kebutuhan proyek atau pesan Anda...',
      nameLabel: 'Nama Lengkap',
      phoneLabel: 'No. Telepon / WhatsApp (Opsional)',
      subjectLabel: 'Subjek',
      messageLabel: 'Pesan',
      sendBtn: 'Kirim Pesan',
      sendingBtn: 'Mengirim...',
      successMsg:
        'Terima kasih! Pesan Anda telah terkirim dan tersimpan ke sistem. Saya akan segera menghubungi Anda.',
      errorMsg: 'Gagal mengirim pesan. Silakan coba kembali.',
      downloadCvBtn: 'Unduh Curriculum Vitae (PDF)',
    },
    footer: {
      role: 'Field Geologist | Mineral & Energy Exploration',
      copyright: 'Hak cipta dilindungi. Seluruh log geologi, kartografi & data riset.',
    },
  },
  en: {
    nav: {
      about: 'About Me',
      experience: 'Experience',
      projects: 'Projects',
      certifications: 'Certifications',
      highlights: 'Highlights',
      skills: 'Skills',
      contact: 'Contact',
      downloadCv: 'Download CV',
      roleSubtitle: 'Geological Engineering',
    },
    hero: {
      educationLabel: 'Education:',
      universityLabel: 'University:',
      domicileLabel: 'Location:',
      certificationLabel: 'GPA:',
      contactBtn: 'Contact Me',
      portfolioBtn: 'View Portfolio',
    },
    experience: {
      sectionTitle: 'Work Experience',
      badge: 'Career Stratigraphy',
      viewProject: 'View Project',
    },
    projects: {
      sectionTitle: 'Project Portfolio',
      badge: 'Key Field Projects',
      deliverableLabel: 'Deliverable',
      viewProject: 'View Project',
    },
    certifications: {
      sectionTitle: 'Certifications & Training',
      badge: 'Verified Credentials',
      viewCredential: 'View Credential',
    },
    highlights: {
      sectionTitle: 'Achievements & Highlights',
      badge: 'Exploration & Academic Metrics',
    },
    skills: {
      sectionTitle: 'Technical Competencies',
      badge: 'Core Capabilities',
    },
    contact: {
      sectionTitle: 'Contact Me',
      sectionSubtitle:
        'Open for mineral exploration consulting, field outcrop mapping, 3D modeling projects, and geological research collaboration.',
      emailLabel: 'Email',
      waLabel: 'WhatsApp / Mobile',
      domicileLabel: 'Operational Base',
      formTitle: 'Send a Direct Message',
      formSubtitle:
        'Fill in the form below to submit project inquiries or collaboration proposals.',
      namePlaceholder: 'e.g., Dr. Johnathan Smith',
      emailPlaceholder: 'name@organization.com',
      phonePlaceholder: '+62 / +1...',
      subjectPlaceholder: 'Exploration Project / Consulting Inquiry',
      messagePlaceholder: 'Describe your project requirements or proposal...',
      nameLabel: 'Full Name',
      phoneLabel: 'Phone / WhatsApp (Optional)',
      subjectLabel: 'Subject',
      messageLabel: 'Message',
      sendBtn: 'Send Message',
      sendingBtn: 'Sending...',
      successMsg:
        'Thank you! Your message has been sent successfully. I will get back to you shortly.',
      errorMsg: 'Failed to send message. Please try again.',
      downloadCvBtn: 'Download Curriculum Vitae (PDF)',
    },
    footer: {
      role: 'Field Geologist | Mineral & Energy Exploration',
      copyright: 'All rights reserved. Geological logs, cartography & research data.',
    },
  },
};

// Helper function to resolve dynamic translation for a string
export function translateText(text?: string, dict: Record<string, string> = {}): string {
  if (!text) return '';
  const trimmed = text.trim();
  return dict[trimmed] || defaultDictionaryEN[trimmed] || text;
}

// Localize Profile: strictly follows the database record.
// If explicit `_en` is set in DB, use it; otherwise, use translated DB value.
export function getLocalizedProfile(
  profile: Profile,
  lang: Language,
  dict: Record<string, string> = {}
): Profile {
  if (lang === 'en') {
    return {
      ...profile,
      title: profile.title_en || translateText(profile.title, dict),
      bio: profile.bio_en || translateText(profile.bio, dict),
      education: profile.education_en || translateText(profile.education, dict),
      university: profile.university_en || translateText(profile.university, dict),
      location: profile.location_en || translateText(profile.location, dict),
      certification_badge:
        profile.certification_badge_en || translateText(profile.certification_badge, dict),
      quote: profile.quote_en || translateText(profile.quote, dict),
    };
  }
  return profile;
}

// Localize Experiences: strictly follows the database record.
export function getLocalizedExperiences(
  experiences: Experience[],
  lang: Language,
  dict: Record<string, string> = {}
): Experience[] {
  if (lang === 'en') {
    return experiences.map((exp) => ({
      ...exp,
      title: exp.title_en || translateText(exp.title, dict),
      location: exp.location_en || translateText(exp.location, dict),
      period: exp.period_en || translateText(exp.period, dict),
      description: exp.description_en || translateText(exp.description, dict),
      tags: exp.tags?.map((tag) => translateText(tag, dict)) || [],
      skills: exp.skills?.map((sk) => translateText(sk, dict)) || [],
      responsibilities:
        exp.responsibilities?.map((r) => translateText(r, dict)) || [],
    }));
  }
  return experiences;
}

// Localize Projects: strictly follows the database record.
export function getLocalizedProjects(
  projects: Project[],
  lang: Language,
  dict: Record<string, string> = {}
): Project[] {
  if (lang === 'en') {
    return projects.map((proj) => ({
      ...proj,
      title: proj.title_en || translateText(proj.title, dict),
      location: proj.location_en || translateText(proj.location, dict),
      duration: proj.duration_en || translateText(proj.duration, dict),
      description: proj.description_en || translateText(proj.description, dict),
      deliverable: proj.deliverable_en || translateText(proj.deliverable, dict),
      tags: proj.tags?.map((tag) => translateText(tag, dict)) || [],
    }));
  }
  return projects;
}

// Localize Certifications: strictly follows the database record.
export function getLocalizedCertifications(
  certifications: Certification[],
  lang: Language,
  dict: Record<string, string> = {}
): Certification[] {
  if (lang === 'en') {
    return certifications.map((cert) => ({
      ...cert,
      title: cert.title_en || translateText(cert.title, dict),
      description: cert.description_en || translateText(cert.description, dict),
    }));
  }
  return certifications;
}

// Localize Skills: strictly follows the database record.
export function getLocalizedSkills(
  skills: SkillCategory[],
  lang: Language,
  dict: Record<string, string> = {}
): SkillCategory[] {
  if (lang === 'en') {
    return skills.map((skill) => ({
      ...skill,
      category: skill.category_en || translateText(skill.category, dict),
      items: skill.items.map((item) => translateText(item, dict)),
    }));
  }
  return skills;
}

// Localize Highlights: strictly follows the database record.
export function getLocalizedHighlights(
  highlights: Highlight[],
  lang: Language,
  dict: Record<string, string> = {}
): Highlight[] {
  if (lang === 'en') {
    return highlights.map((hl) => ({
      ...hl,
      value: hl.value,
      label: translateText(hl.label, dict),
      description: translateText(hl.description, dict),
    }));
  }
  return highlights;
}
