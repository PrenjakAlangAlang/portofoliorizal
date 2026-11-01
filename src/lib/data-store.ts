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
        const { data, error } = await client
          .from('profiles')
          .upsert({ ...merged, id: 'profile-main' })
          .select()
          .single();

        if (!error && data) {
          memoryProfile = data as Profile;
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

      if (!error && data && data.length > 0) {
        return data as Experience[];
      }
    } catch (e) {
      console.warn('Error fetching experiences from Supabase:', e);
    }
  }
  return memoryExperiences.sort((a, b) => a.order_index - b.order_index);
}

export async function saveExperience(item: Experience): Promise<Experience> {
  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('experiences')
          .upsert(item)
          .select()
          .single();

        if (!error && data) {
          const idx = memoryExperiences.findIndex((e) => e.id === item.id);
          if (idx >= 0) memoryExperiences[idx] = data as Experience;
          else memoryExperiences.push(data as Experience);
          return data as Experience;
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

      if (!error && data && data.length > 0) {
        return data as Project[];
      }
    } catch (e) {
      console.warn('Error fetching projects from Supabase:', e);
    }
  }
  return memoryProjects.sort((a, b) => a.order_index - b.order_index);
}

export async function saveProject(item: Project): Promise<Project> {
  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('projects')
          .upsert(item)
          .select()
          .single();

        if (!error && data) {
          const idx = memoryProjects.findIndex((p) => p.id === item.id);
          if (idx >= 0) memoryProjects[idx] = data as Project;
          else memoryProjects.push(data as Project);
          return data as Project;
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

      if (!error && data && data.length > 0) {
        return data as Certification[];
      }
    } catch (e) {
      console.warn('Error fetching certifications from Supabase:', e);
    }
  }
  return memoryCertifications.sort((a, b) => a.order_index - b.order_index);
}

export async function saveCertification(item: Certification): Promise<Certification> {
  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('certifications')
          .upsert(item)
          .select()
          .single();

        if (!error && data) {
          const idx = memoryCertifications.findIndex((c) => c.id === item.id);
          if (idx >= 0) memoryCertifications[idx] = data as Certification;
          else memoryCertifications.push(data as Certification);
          return data as Certification;
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

      if (!error && data && data.length > 0) {
        return data as SkillCategory[];
      }
    } catch (e) {
      console.warn('Error fetching skills from Supabase:', e);
    }
  }
  return memorySkills.sort((a, b) => a.order_index - b.order_index);
}

export async function saveSkillCategory(item: SkillCategory): Promise<SkillCategory> {
  if (isSupabaseConfigured()) {
    const client = getAdminSupabase();
    if (client) {
      try {
        const { data, error } = await client
          .from('skills')
          .upsert(item)
          .select()
          .single();

        if (!error && data) {
          const idx = memorySkills.findIndex((s) => s.id === item.id);
          if (idx >= 0) memorySkills[idx] = data as SkillCategory;
          else memorySkills.push(data as SkillCategory);
          return data as SkillCategory;
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
