export interface Profile {
  id?: string;
  name: string;
  title: string;
  title_en?: string;
  status_badge?: string;
  status_badge_en?: string;
  bio: string;
  bio_en?: string;
  education: string;
  education_en?: string;
  university: string;
  university_en?: string;
  location: string;
  location_en?: string;
  certification_badge: string;
  certification_badge_en?: string;
  iagi_number?: string;
  avatar_url: string;
  cv_url: string;
  quote: string;
  quote_en?: string;
  datum_info?: string;
  email: string;
  phone: string;
  linkedin_url?: string;
  researchgate_url?: string;
  github_url?: string;
  updated_at?: string;
}

export interface Experience {
  id: string;
  title: string;
  title_en?: string;
  company: string;
  location: string;
  location_en?: string;
  period: string;
  period_en?: string;
  description: string;
  description_en?: string;
  tags: string[];
  skills?: string[];
  responsibilities?: string[];
  document_url?: string;
  document_name?: string;
  order_index: number;
}

export function parseResponsibilities(
  description?: string,
  responsibilities?: string[]
): string[] {
  if (responsibilities && responsibilities.length > 0) {
    return responsibilities
      .map((r) => r.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);
  }

  if (!description) return [];

  // If text contains bullet characters '•'
  if (description.includes('•')) {
    return description
      .split('•')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  // If text contains newlines
  if (description.includes('\n')) {
    return description
      .split(/\r?\n+/)
      .map((line) => line.replace(/^[-*•\d+.]\s*/, '').trim())
      .filter(Boolean);
  }

  return [description.trim()];
}

export interface ProjectDetails {
  objectives?: string[];
  dataset?: string[];
  workflow?: string[];
  methods?: string[];
  results?: string[];
  key_findings?: string[];
  software_used?: string[];
  doc_description?: string;
  doc_tags?: string[];
}

export interface Project {
  id: string;
  title: string;
  title_en?: string;
  location: string;
  location_en?: string;
  duration: string;
  duration_en?: string;
  description: string;
  description_en?: string;
  deliverable?: string;
  deliverable_en?: string;
  deliverable_color?: 'primary' | 'secondary' | 'tertiary' | 'error';
  tags?: string[];
  image_url: string;
  document_url?: string;
  document_name?: string;
  details?: ProjectDetails;
  order_index: number;
}

export interface Certification {
  id: string;
  title: string;
  title_en?: string;
  issuer: string;
  year: string;
  description: string;
  description_en?: string;
  credential_url?: string;
  order_index: number;
}

export interface Highlight {
  id: string;
  value: string;
  label: string;
  description: string;
  order_index: number;
}

export interface SkillCategory {
  id: string;
  category: string;
  category_en?: string;
  icon_name?: string;
  items: string[];
  order_index: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface AdminCredentials {
  id?: string;
  username: string;
  password: string;
  updated_at?: string;
}
