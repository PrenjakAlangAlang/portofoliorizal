import { isSupabaseConfigured, getAdminSupabase, supabase } from './supabase';
import {
  Profile,
  Experience,
  Project,
  Certification,
  SkillCategory,
  ContactMessage,
  AdminCredentials,
} from './types';
import {
  initialProfile,
  initialExperiences,
  initialProjects,
  initialCertifications,
  initialSkills,
  initialMessages
} from './initial-data';

// In-memory memory fallback store when Supabase is not connected
let memoryProfile: Profile = { ...initialProfile };
let memoryExperiences: Experience[] = [...initialExperiences];
let memoryProjects: Project[] = [...initialProjects];
let memoryCertifications: Certification[] = [...initialCertifications];
let memorySkills: SkillCategory[] = [...initialSkills];
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
              memoryExperiences = seeded as Experience[];
              return memoryExperiences;
            }
          }
        }
        memoryExperiences = data as Experience[];
        return memoryExperiences;
      }
    } catch (e) {
      console.warn('Error fetching experiences from Supabase:', e);
    }
  }
  return memoryExperiences.sort((a, b) => a.order_index - b.order_index);
}

export async function saveExperience(item: Experience): Promise<Experience> {
  const allowedKeys = ['id', 'title', 'company', 'location', 'period', 'description', 'tags', 'order_index'];
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
          .from('experiences')
          .upsert(dbPayload)
          .select()
          .single();

        if (error) {
          console.error('Error saving experience to Supabase:', error);
        } else if (data) {
          const saved = data as Experience;
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

  const idx = memoryExperiences.findIndex((e) => e.id === item.id);
  if (idx >= 0) {
    memoryExperiences[idx] = item;
  } else {
    memoryExperiences.push(item);
  }
  return item;
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
            const sanitized = initialProjects.map((p) => ({
              id: p.id,
              title: p.title,
              location: p.location,
              duration: p.duration,
              description: p.description,
              deliverable: p.deliverable,
              deliverable_color: p.deliverable_color,
              tags: p.tags,
              image_url: p.image_url,
              order_index: p.order_index,
            }));
            const { data: seeded } = await client.from('projects').upsert(sanitized).select();
            if (seeded && seeded.length > 0) {
              memoryProjects = seeded as Project[];
              return memoryProjects;
            }
          }
        }
        memoryProjects = data as Project[];
        return memoryProjects;
      }
    } catch (e) {
      console.warn('Error fetching projects from Supabase:', e);
    }
  }
  return memoryProjects.sort((a, b) => a.order_index - b.order_index);
}

export async function saveProject(item: Project): Promise<Project> {
  const allowedKeys = [
    'id', 'title', 'location', 'duration', 'description',
    'deliverable', 'deliverable_color', 'tags', 'image_url', 'order_index'
  ];
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
          .from('projects')
          .upsert(dbPayload)
          .select()
          .single();

        if (error) {
          console.error('Error saving project to Supabase:', error);
        } else if (data) {
          const saved = data as Project;
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

  const idx = memoryProjects.findIndex((p) => p.id === item.id);
  if (idx >= 0) {
    memoryProjects[idx] = item;
  } else {
    memoryProjects.push(item);
  }
  return item;
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
