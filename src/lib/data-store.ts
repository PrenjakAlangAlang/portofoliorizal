import { isSupabaseConfigured, getAdminSupabase, supabase } from './supabase';
import {
  Profile,
  Experience,
  Project,
  Certification,
  SkillCategory,
  ContactMessage,
  AdminCredentials,
  Highlight,
  ProjectDetails,
} from './types';
import {
  initialProfile,
  initialExperiences,
  initialProjects,
  initialCertifications,
  initialSkills,
  initialMessages,
  initialHighlights,
} from './initial-data';

// In-memory memory fallback store when Supabase is not connected
let memoryProfile: Profile = { ...initialProfile };
let memoryExperiences: Experience[] = [...initialExperiences];
let memoryProjects: Project[] = [...initialProjects];
let memoryCertifications: Certification[] = [...initialCertifications];
let memorySkills: SkillCategory[] = [...initialSkills];
let memoryHighlights: Highlight[] = [...initialHighlights];
let memoryMessages: ContactMessage[] = [...initialMessages];
let memoryCredentials: AdminCredentials = {
  id: 'primary',
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'geolog2026',
  updated_at: new Date().toISOString(),
};

// --- PROFILE ---
export async function getProfile(): Promise<Profile> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'profile-main')
        .maybeSingle();

      if (!error && data) {
        return data as Profile;
      }
    } catch (e) {
      console.warn('Error fetching profile from Supabase, using fallback:', e);
    }
  }
  return memoryProfile;
}

export async function updateProfile(updated: Partial<Profile>): Promise<Profile> {
  const merged: Profile = {
    ...memoryProfile,
    ...updated,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        const allowedKeys = [
          'id', 'name', 'title', 'status_badge', 'bio', 'education',
          'university', 'location', 'certification_badge', 'iagi_number',
          'avatar_url', 'cv_url', 'quote', 'datum_info', 'email', 'phone',
          'linkedin_url', 'researchgate_url', 'github_url', 'updated_at'
        ];
        const dbPayload: Record<string, unknown> = { id: 'profile-main' };
        const mergedRecord = merged as unknown as Record<string, unknown>;
        for (const key of allowedKeys) {
          if (mergedRecord[key] !== undefined) {
            dbPayload[key] = mergedRecord[key];
          }
        }

        const { data, error } = await client
          .from('profiles')
          .upsert(dbPayload)
          .select()
          .single();

        if (error) {
          console.error('Supabase updateProfile error:', error);
        } else if (data) {
          memoryProfile = { ...merged, ...(data as Profile) };
          return memoryProfile;
        }
      } catch (e) {
        console.warn('Error updating profile in Supabase:', e);
      }
    }
  }

  memoryProfile = merged;
  return memoryProfile;
}

// --- EXPERIENCES ---
function parseExperienceItem(e: Experience): Experience {
  if (!e.tags || !Array.isArray(e.tags)) return e;
  let document_url = e.document_url;
  let document_name = e.document_name;
  let skills = e.skills ? [...e.skills] : [];
  let responsibilities = e.responsibilities ? [...e.responsibilities] : [];
  const regularTags: string[] = [];

  for (const t of e.tags) {
    if (typeof t === 'string' && t.startsWith('__doc:')) {
      document_url = t.slice(6);
    } else if (typeof t === 'string' && t.startsWith('__docname:')) {
      document_name = t.slice(10);
    } else if (typeof t === 'string' && t.startsWith('__skills:')) {
      try {
        skills = JSON.parse(t.slice(9));
      } catch {
        // ignore
      }
    } else if (typeof t === 'string' && t.startsWith('__resp:')) {
      try {
        responsibilities = JSON.parse(t.slice(7));
      } catch {
        // ignore
      }
    } else {
      regularTags.push(t);
    }
  }

  return {
    ...e,
    tags: regularTags,
    skills,
    responsibilities,
    document_url,
    document_name,
  };
}

export async function getExperiences(): Promise<Experience[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data) {
        if (data.length === 0 && initialExperiences.length > 0) {
          const client = getAdminSupabase();
          if (client) {
            const sanitized = initialExperiences.map((e) => ({
              id: e.id,
              title: e.title,
              company: e.company,
              location: e.location,
              period: e.period,
              description: e.description,
              tags: e.tags,
              order_index: e.order_index,
            }));
            const { data: seeded } = await client.from('experiences').upsert(sanitized).select();
            if (seeded && seeded.length > 0) {
              memoryExperiences = (seeded as Experience[]).map(parseExperienceItem);
              return memoryExperiences;
            }
          }
        }
        memoryExperiences = (data as Experience[]).map(parseExperienceItem);
        return memoryExperiences;
      }
    } catch (e) {
      console.warn('Error fetching experiences from Supabase:', e);
    }
  }
  return memoryExperiences.map(parseExperienceItem).sort((a, b) => a.order_index - b.order_index);
}

export async function saveExperience(item: Experience): Promise<Experience> {
  const allowedKeys = ['id', 'title', 'company', 'location', 'period', 'description', 'tags', 'order_index'];
  const dbPayload: Record<string, unknown> = {};

  const cleanedTags = (item.tags || []).filter(
    (t) =>
      typeof t === 'string' &&
      !t.startsWith('__doc:') &&
      !t.startsWith('__docname:') &&
      !t.startsWith('__skills:') &&
      !t.startsWith('__resp:')
  );

  if (item.document_url) {
    cleanedTags.push(`__doc:${item.document_url}`);
  }
  if (item.document_name) {
    cleanedTags.push(`__docname:${item.document_name}`);
  }
  if (item.skills && item.skills.length > 0) {
    cleanedTags.push(`__skills:${JSON.stringify(item.skills)}`);
  }
  if (item.responsibilities && item.responsibilities.length > 0) {
    cleanedTags.push(`__resp:${JSON.stringify(item.responsibilities)}`);
  }

  const record = { ...item, tags: cleanedTags } as unknown as Record<string, unknown>;
  for (const k of allowedKeys) {
    if (record[k] !== undefined) dbPayload[k] = record[k];
  }

  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('experiences')
          .upsert(dbPayload)
          .select()
          .single();

        if (error) {
          console.error('Error saving experience to Supabase:', error);
        } else if (data) {
          const saved = parseExperienceItem(data as Experience);
          const idx = memoryExperiences.findIndex((e) => e.id === item.id);
          if (idx >= 0) memoryExperiences[idx] = saved;
          else memoryExperiences.push(saved);
          return saved;
        }
      } catch (e) {
        console.warn('Error saving experience to Supabase:', e);
      }
    }
  }

  const parsed = parseExperienceItem(item);
  const idx = memoryExperiences.findIndex((e) => e.id === item.id);
  if (idx >= 0) {
    memoryExperiences[idx] = parsed;
  } else {
    memoryExperiences.push(parsed);
  }
  return parsed;
}

export async function deleteExperience(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        await client.from('experiences').delete().eq('id', id);
      } catch (e) {
        console.warn('Error deleting experience from Supabase:', e);
      }
    }
  }
  memoryExperiences = memoryExperiences.filter((e) => e.id !== id);
  return true;
}

// Helper to unpack document_url, document_name, and details stored in tags
function parseProjectDocument(p: Project): Project {
  if (!p.tags || !Array.isArray(p.tags)) return p;
  let document_url = p.document_url;
  let document_name = p.document_name;
  let details = p.details;
  const regularTags: string[] = [];

  for (const t of p.tags) {
    if (typeof t === 'string' && t.startsWith('__doc:')) {
      document_url = t.slice(6);
    } else if (typeof t === 'string' && t.startsWith('__docname:')) {
      document_name = t.slice(10);
    } else if (typeof t === 'string' && t.startsWith('__details:')) {
      try {
        details = JSON.parse(t.slice(10));
      } catch {
        // ignore malformed
      }
    } else {
      regularTags.push(t);
    }
  }

  return {
    ...p,
    tags: regularTags,
    document_url,
    document_name,
    details,
  };
}

// --- PROJECTS ---
export async function getProjects(): Promise<Project[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data) {
        if (data.length === 0 && initialProjects.length > 0) {
          const client = getAdminSupabase();
          if (client) {
            const sanitized = initialProjects.map((p) => {
              const tags = [...(p.tags || [])];
              if (p.document_url) tags.push(`__doc:${p.document_url}`);
              if (p.document_name) tags.push(`__docname:${p.document_name}`);
              if (p.details) tags.push(`__details:${JSON.stringify(p.details)}`);
              return {
                id: p.id,
                title: p.title,
                location: p.location,
                duration: p.duration,
                description: p.description,
                deliverable: p.deliverable,
                deliverable_color: p.deliverable_color,
                tags,
                image_url: p.image_url,
                order_index: p.order_index,
              };
            });
            const { data: seeded } = await client.from('projects').upsert(sanitized).select();
            if (seeded && seeded.length > 0) {
              memoryProjects = seeded.map(parseProjectDocument) as Project[];
              return memoryProjects;
            }
          }
        }
        memoryProjects = (data as Project[]).map(parseProjectDocument);
        return memoryProjects;
      }
    } catch (e) {
      console.warn('Error fetching projects from Supabase:', e);
    }
  }
  return memoryProjects.map(parseProjectDocument).sort((a, b) => a.order_index - b.order_index);
}

export async function saveProject(item: Project): Promise<Project> {
  const allowedKeys = [
    'id', 'title', 'location', 'duration', 'description',
    'deliverable', 'deliverable_color', 'tags', 'image_url', 'order_index'
  ];
  const dbPayload: Record<string, unknown> = {};

  // Package document_url, document_name, and details into tags for persistence without requiring DB schema changes
  const cleanedTags = (item.tags || []).filter(
    (t) =>
      typeof t === 'string' &&
      !t.startsWith('__doc:') &&
      !t.startsWith('__docname:') &&
      !t.startsWith('__details:')
  );
  if (item.document_url) {
    cleanedTags.push(`__doc:${item.document_url}`);
  }
  if (item.document_name) {
    cleanedTags.push(`__docname:${item.document_name}`);
  }
  if (item.details) {
    cleanedTags.push(`__details:${JSON.stringify(item.details)}`);
  }

  const record = { ...item, tags: cleanedTags } as unknown as Record<string, unknown>;
  for (const k of allowedKeys) {
    if (record[k] !== undefined) dbPayload[k] = record[k];
  }

  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('projects')
          .upsert(dbPayload)
          .select()
          .single();

        if (error) {
          console.error('Error saving project to Supabase:', error);
        } else if (data) {
          const saved = parseProjectDocument(data as Project);
          const idx = memoryProjects.findIndex((p) => p.id === item.id);
          if (idx >= 0) memoryProjects[idx] = saved;
          else memoryProjects.push(saved);
          return saved;
        }
      } catch (e) {
        console.warn('Error saving project to Supabase:', e);
      }
    }
  }

  const finalItem = parseProjectDocument({ ...item, tags: cleanedTags });
  const idx = memoryProjects.findIndex((p) => p.id === item.id);
  if (idx >= 0) {
    memoryProjects[idx] = finalItem;
  } else {
    memoryProjects.push(finalItem);
  }
  return finalItem;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        await client.from('projects').delete().eq('id', id);
      } catch (e) {
        console.warn('Error deleting project from Supabase:', e);
      }
    }
  }
  memoryProjects = memoryProjects.filter((p) => p.id !== id);
  return true;
}

// --- CERTIFICATIONS ---
export async function getCertifications(): Promise<Certification[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data) {
        if (data.length === 0 && initialCertifications.length > 0) {
          const client = getAdminSupabase();
          if (client) {
            const sanitized = initialCertifications.map((c) => ({
              id: c.id,
              title: c.title,
              issuer: c.issuer,
              year: c.year,
              description: c.description,
              credential_url: c.credential_url,
              order_index: c.order_index,
            }));
            const { data: seeded } = await client.from('certifications').upsert(sanitized).select();
            if (seeded && seeded.length > 0) {
              memoryCertifications = seeded as Certification[];
              return memoryCertifications;
            }
          }
        }
        memoryCertifications = data as Certification[];
        return memoryCertifications;
      }
    } catch (e) {
      console.warn('Error fetching certifications from Supabase:', e);
    }
  }
  return memoryCertifications.sort((a, b) => a.order_index - b.order_index);
}

export async function saveCertification(item: Certification): Promise<Certification> {
  const allowedKeys = ['id', 'title', 'issuer', 'year', 'description', 'credential_url', 'order_index'];
  const dbPayload: Record<string, unknown> = {};
  const record = item as unknown as Record<string, unknown>;
  for (const k of allowedKeys) {
    if (record[k] !== undefined) dbPayload[k] = record[k];
  }

  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('certifications')
          .upsert(dbPayload)
          .select()
          .single();

        if (error) {
          console.error('Error saving certification to Supabase:', error);
        } else if (data) {
          const saved = data as Certification;
          const idx = memoryCertifications.findIndex((c) => c.id === item.id);
          if (idx >= 0) memoryCertifications[idx] = saved;
          else memoryCertifications.push(saved);
          return saved;
        }
      } catch (e) {
        console.warn('Error saving certification to Supabase:', e);
      }
    }
  }

  const idx = memoryCertifications.findIndex((c) => c.id === item.id);
  if (idx >= 0) {
    memoryCertifications[idx] = item;
  } else {
    memoryCertifications.push(item);
  }
  return item;
}

export async function deleteCertification(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        await client.from('certifications').delete().eq('id', id);
      } catch (e) {
        console.warn('Error deleting certification from Supabase:', e);
      }
    }
  }
  memoryCertifications = memoryCertifications.filter((c) => c.id !== id);
  return true;
}

// --- HIGHLIGHTS (Pencapaian & Sorotan) ---
export async function getHighlights(): Promise<Highlight[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      // 1. Try dedicated table first
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data && data.length > 0) {
        memoryHighlights = data as Highlight[];
        return memoryHighlights;
      }

      // 2. If table doesn't exist or empty, check datum_info in profiles
      const { data: profData } = await supabase
        .from('profiles')
        .select('datum_info')
        .eq('id', 'profile-main')
        .maybeSingle();

      if (profData?.datum_info) {
        try {
          const parsed = JSON.parse(profData.datum_info);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryHighlights = parsed as Highlight[];
            return memoryHighlights.sort((a, b) => a.order_index - b.order_index);
          }
        } catch {
          // not json format yet
        }
      }
    } catch (e) {
      console.warn('Error fetching highlights from Supabase:', e);
    }
  }
  return memoryHighlights.sort((a, b) => a.order_index - b.order_index);
}

export async function saveHighlight(item: Highlight): Promise<Highlight> {
  const allowedKeys = ['id', 'value', 'label', 'description', 'order_index'];
  const dbPayload: Record<string, unknown> = {};
  const record = item as unknown as Record<string, unknown>;
  for (const k of allowedKeys) {
    if (record[k] !== undefined) dbPayload[k] = record[k];
  }

  // Update in memory first
  const idx = memoryHighlights.findIndex((h) => h.id === item.id);
  if (idx >= 0) {
    memoryHighlights[idx] = item;
  } else {
    memoryHighlights.push(item);
  }

  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        // Try saving to highlights table
        const { data, error } = await client
          .from('highlights')
          .upsert(dbPayload)
          .select()
          .single();

        if (!error && data) {
          const saved = data as Highlight;
          const i = memoryHighlights.findIndex((h) => h.id === item.id);
          if (i >= 0) memoryHighlights[i] = saved;
          return saved;
        }

        // If table doesn't exist, persist array into profiles.datum_info
        await client
          .from('profiles')
          .update({ datum_info: JSON.stringify(memoryHighlights) })
          .eq('id', 'profile-main');
      } catch (e) {
        console.warn('Error saving highlight to Supabase:', e);
      }
    }
  }

  return item;
}

export async function deleteHighlight(id: string): Promise<boolean> {
  memoryHighlights = memoryHighlights.filter((h) => h.id !== id);

  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        await client.from('highlights').delete().eq('id', id);
        // Also persist updated array to profiles.datum_info
        await client
          .from('profiles')
          .update({ datum_info: JSON.stringify(memoryHighlights) })
          .eq('id', 'profile-main');
      } catch (e) {
        console.warn('Error deleting highlight from Supabase:', e);
      }
    }
  }

  return true;
}

// --- SKILLS ---
export async function getSkills(): Promise<SkillCategory[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data) {
        if (data.length === 0 && initialSkills.length > 0) {
          const client = getAdminSupabase();
          if (client) {
            const sanitized = initialSkills.map((s) => ({
              id: s.id,
              category: s.category,
              icon_name: s.icon_name || 'terrain',
              items: s.items,
              order_index: s.order_index,
            }));
            const { data: seeded } = await client.from('skills').upsert(sanitized).select();
            if (seeded && seeded.length > 0) {
              memorySkills = seeded as SkillCategory[];
              return memorySkills;
            }
          }
        }
        memorySkills = data as SkillCategory[];
        return memorySkills;
      }
    } catch (e) {
      console.warn('Error fetching skills from Supabase:', e);
    }
  }
  return memorySkills.sort((a, b) => a.order_index - b.order_index);
}

export async function saveSkillCategory(item: SkillCategory): Promise<SkillCategory> {
  const allowedKeys = ['id', 'category', 'icon_name', 'items', 'order_index'];
  const dbPayload: Record<string, unknown> = {};
  const record = item as unknown as Record<string, unknown>;
  for (const k of allowedKeys) {
    if (record[k] !== undefined) dbPayload[k] = record[k];
  }

  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('skills')
          .upsert(dbPayload)
          .select()
          .single();

        if (error) {
          console.error('Error saving skill category to Supabase:', error);
        } else if (data) {
          const saved = data as SkillCategory;
          const idx = memorySkills.findIndex((s) => s.id === item.id);
          if (idx >= 0) memorySkills[idx] = saved;
          else memorySkills.push(saved);
          return saved;
        }
      } catch (e) {
        console.warn('Error saving skill category to Supabase:', e);
      }
    }
  }

  const idx = memorySkills.findIndex((s) => s.id === item.id);
  if (idx >= 0) {
    memorySkills[idx] = item;
  } else {
    memorySkills.push(item);
  }
  return item;
}

export async function deleteSkillCategory(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        await client.from('skills').delete().eq('id', id);
      } catch (e) {
        console.warn('Error deleting skill from Supabase:', e);
      }
    }
  }
  memorySkills = memorySkills.filter((s) => s.id !== id);
  return true;
}

// --- CONTACT MESSAGES ---
export async function getContactMessages(): Promise<ContactMessage[]> {
  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as ContactMessage[];
        }
      } catch (e) {
        console.warn('Error fetching messages from Supabase:', e);
      }
    }
  }
  return memoryMessages;
}

export async function submitContactMessage(msg: Omit<ContactMessage, 'id' | 'created_at' | 'is_read'>): Promise<ContactMessage> {
  const newMsg: ContactMessage = {
    ...msg,
    id: `msg-${Date.now()}`,
    created_at: new Date().toISOString(),
    is_read: false
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert({
          id: newMsg.id,
          name: newMsg.name,
          email: newMsg.email,
          phone: newMsg.phone,
          subject: newMsg.subject,
          message: newMsg.message,
          is_read: false
        })
        .select()
        .single();

      if (!error && data) {
        memoryMessages.unshift(data as ContactMessage);
        return data as ContactMessage;
      }
    } catch (e) {
      console.warn('Error submitting contact message to Supabase:', e);
    }
  }

  memoryMessages.unshift(newMsg);
  return newMsg;
}

export async function toggleMessageRead(id: string, is_read: boolean): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        await client.from('contact_messages').update({ is_read }).eq('id', id);
      } catch (e) {
        console.warn('Error updating message status in Supabase:', e);
      }
    }
  }
  const item = memoryMessages.find((m) => m.id === id);
  if (item) item.is_read = is_read;
  return true;
}

export async function deleteMessage(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        await client.from('contact_messages').delete().eq('id', id);
      } catch (e) {
        console.warn('Error deleting message from Supabase:', e);
      }
    }
  }
  memoryMessages = memoryMessages.filter((m) => m.id !== id);
  return true;
}

// --- ADMIN CREDENTIALS ---
export async function getAdminCredentials(): Promise<AdminCredentials> {
  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('admin_credentials')
          .select('*')
          .eq('id', 'primary')
          .single();

        if (!error && data) {
          memoryCredentials = data as AdminCredentials;
          return memoryCredentials;
        }

        // If table exists but empty, insert initial default
        if (error && (error.code === 'PGRST116' || error.message?.includes('0 rows'))) {
          await client.from('admin_credentials').insert(memoryCredentials);
        }
      } catch (e) {
        console.warn('Error reading admin_credentials from Supabase:', e);
      }
    }
  }
  return memoryCredentials;
}

export async function updateAdminCredentials(username: string, password: string): Promise<AdminCredentials> {
  const updated: AdminCredentials = {
    id: 'primary',
    username: username.trim(),
    password,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('admin_credentials')
          .upsert(updated)
          .select()
          .single();

        if (!error && data) {
          memoryCredentials = data as AdminCredentials;
          return memoryCredentials;
        }
      } catch (e) {
        console.warn('Error updating admin_credentials in Supabase:', e);
      }
    }
  }

  memoryCredentials = updated;
  return memoryCredentials;
}

export async function verifyAdminLogin(username: string, password: string): Promise<boolean> {
  const creds = await getAdminCredentials();
  return (
    creds.username.trim().toLowerCase() === username.trim().toLowerCase() &&
    creds.password === password
  );
}
