-- =======================================================
-- Stitch Geologist Portfolio - Supabase Database Schema
-- Run this in your Supabase SQL Editor to create tables,
-- enable Row Level Security, and insert seed data.
-- =======================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT 'profile-main',
  name TEXT NOT NULL DEFAULT 'Ratna Sari, S.T.',
  title TEXT NOT NULL DEFAULT 'Geologist • Exploration & 3D Modeling Specialist',
  status_badge TEXT NOT NULL DEFAULT 'Tersedia untuk Proyek & Konsultansi',
  bio TEXT NOT NULL,
  education TEXT NOT NULL DEFAULT 'S1 Teknik Geologi',
  university TEXT NOT NULL DEFAULT 'Univ. Padjadjaran (UNPAD)',
  location TEXT NOT NULL DEFAULT 'Bandung & Balikpapan',
  certification_badge TEXT NOT NULL DEFAULT 'K3 & POP Minerba ESDM',
  iagi_number TEXT NOT NULL DEFAULT 'IAGI Member #4892',
  avatar_url TEXT NOT NULL,
  cv_url TEXT DEFAULT '#resume',
  quote TEXT NOT NULL,
  datum_info TEXT NOT NULL DEFAULT 'DATUM: WGS 84 / UTM ZONE 49S | 07°47''28"S 110°22''09"E',
  email TEXT NOT NULL DEFAULT 'ratna.geologist@earthmail.id',
  phone TEXT NOT NULL DEFAULT '+62 812-3456-7890',
  linkedin_url TEXT DEFAULT 'https://linkedin.com',
  researchgate_url TEXT DEFAULT 'https://researchgate.net',
  github_url TEXT DEFAULT 'https://github.com',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Experiences Table (Pengalaman Kerja)
CREATE TABLE IF NOT EXISTS public.experiences (
  id TEXT PRIMARY KEY DEFAULT concat('exp-', gen_random_uuid()),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Projects Table (Pengalaman Proyek)
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT concat('proj-', gen_random_uuid()),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  duration TEXT NOT NULL,
  description TEXT NOT NULL,
  deliverable TEXT NOT NULL,
  deliverable_color TEXT DEFAULT 'primary',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Certifications Table (Sertifikasi dan Pelatihan)
CREATE TABLE IF NOT EXISTS public.certifications (
  id TEXT PRIMARY KEY DEFAULT concat('cert-', gen_random_uuid()),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  year TEXT NOT NULL,
  description TEXT NOT NULL,
  credential_url TEXT DEFAULT '#',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Skills Table (Keahlian Teknis)
CREATE TABLE IF NOT EXISTS public.skills (
  id TEXT PRIMARY KEY DEFAULT concat('skill-', gen_random_uuid()),
  category TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'terrain',
  items TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Contact Messages Table (Pesan Masuk dari Pengunjung)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY DEFAULT concat('msg-', gen_random_uuid()),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Admin Credentials Table (Akun Login Admin)
CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  username TEXT NOT NULL DEFAULT 'admin',
  password TEXT NOT NULL DEFAULT 'geolog2026',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (Everyone can read portfolio data)
DROP POLICY IF EXISTS "Public can view profile" ON public.profiles;
CREATE POLICY "Public can view profile" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view experiences" ON public.experiences;
CREATE POLICY "Public can view experiences" ON public.experiences FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
CREATE POLICY "Public can view projects" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view certifications" ON public.certifications;
CREATE POLICY "Public can view certifications" ON public.certifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view skills" ON public.skills;
CREATE POLICY "Public can view skills" ON public.skills FOR SELECT USING (true);

-- CONTACT FORM INSERT POLICY (Public can submit contact messages)
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- ADMIN POLICIES (All actions allowed for service role / authenticated admin)
DROP POLICY IF EXISTS "Full access for service role on profiles" ON public.profiles;
CREATE POLICY "Full access for service role on profiles" ON public.profiles USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on experiences" ON public.experiences;
CREATE POLICY "Full access for service role on experiences" ON public.experiences USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on projects" ON public.projects;
CREATE POLICY "Full access for service role on projects" ON public.projects USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on certifications" ON public.certifications;
CREATE POLICY "Full access for service role on certifications" ON public.certifications USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on skills" ON public.skills;
CREATE POLICY "Full access for service role on skills" ON public.skills USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on contact_messages" ON public.contact_messages;
CREATE POLICY "Full access for service role on contact_messages" ON public.contact_messages USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Full access for service role on admin_credentials" ON public.admin_credentials;
CREATE POLICY "Full access for service role on admin_credentials" ON public.admin_credentials USING (true) WITH CHECK (true);

-- =======================================================
-- STORAGE BUCKET FOR FILE UPLOADS (Foto Profil, Foto Proyek, Berkas CV, Presentasi Slide)
-- =======================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('portfolio', 'portfolio', true, 52428800)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 52428800;

DROP POLICY IF EXISTS "Public can view portfolio assets" ON storage.objects;
CREATE POLICY "Public can view portfolio assets" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Anyone can upload to portfolio assets" ON storage.objects;
CREATE POLICY "Anyone can upload to portfolio assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Anyone can update portfolio assets" ON storage.objects;
CREATE POLICY "Anyone can update portfolio assets" ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio');

-- =======================================================
-- INITIAL SEED DATA
-- =======================================================

-- Profile Seed
INSERT INTO public.profiles (
  id, name, title, status_badge, bio, education, university, location,
  certification_badge, iagi_number, avatar_url, cv_url, quote, datum_info,
  email, phone, linkedin_url, researchgate_url, github_url
) VALUES (
  'profile-main',
  'Ratna Sari, S.T.',
  'Geologist • Exploration & 3D Modeling Specialist',
  'Tersedia untuk Proyek & Konsultansi',
  'Praktisi geologi eksplorasi dengan fokus pada pemetaan sistem alterasi hidrotermal, analisis sedimentologi-stratigrafi, dan pemodelan spasial 3D. Berpengalaman memimpin survei singkapan lapangan dan supervisi pemboran mineral di berbagai penjuru Indonesia.',
  'S1 Teknik Geologi',
  'Univ. Padjadjaran (UNPAD)',
  'Bandung & Balikpapan',
  'K3 & POP Minerba ESDM',
  'IAGI Member #4892',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  '#resume',
  '"Mente et Malleo — Menyingkap lapisan litosfer bumi melalui investigasi lapangan berbasis data ilmiah."',
  'DATUM: WGS 84 / UTM ZONE 49S | 07°47''28"S 110°22''09"E',
  'ratna.geologist@earthmail.id',
  '+62 812-3456-7890',
  'https://linkedin.com',
  'https://researchgate.net',
  'https://github.com'
) ON CONFLICT (id) DO UPDATE SET updated_at = now();

-- Experiences Seed
DELETE FROM public.experiences;
INSERT INTO public.experiences (id, title, company, location, period, description, tags, order_index) VALUES
('exp-1', 'Senior Field Exploration Geologist', 'PT Nusa Mineral Nusantara', 'Sumbawa & Halmahera', '2022 — Sekarang', 'Memimpin tim survei geologi lapangan untuk pemetaan alterasi hidrotermal dan supervisi pemboran inti diamond drill >3.500m dalam eksplorasi porfiri Cu-Au.', ARRAY['Core Logging', 'Hydrothermal Alteration', 'Leapfrog 3D'], 0),
('exp-2', 'Junior Exploration Geologist', 'PT Bumi Geocipta Konsultindo', 'Bandung & Site', '2020 — 2022', 'Interpretasi geokimia multielemen (XRF & ICP-MS), evaluasi petrografi mikroskopik, dan pemodelan sesar serta domain geologi menggunakan software 3D.', ARRAY['Geokimia', 'Petrografi', 'ArcGIS Pro'], 1),
('exp-3', 'Field Assistant & Wellsite Mudlogger', 'Geothermal Exploration Unit', 'Jawa Barat', '2019 — 2020', 'Monitoring cutting sampling real-time pada sumur eksplorasi geotermal entalpi tinggi dan pencatatan litologi serta rekahan produktif.', ARRAY['Mudlogging', 'Geotermal'], 2);

-- Projects Seed
DELETE FROM public.projects;
INSERT INTO public.projects (id, title, location, duration, description, deliverable, deliverable_color, tags, image_url, order_index) VALUES
('proj-1', 'Pemetaan Geologi Regional & Alterasi Porfiri Cu-Au', 'Halmahera Utara', '8 Bulan', 'Survei 120 singkapan batuan, zoning alterasi hidrotermal, dan 85 rock chip sampling untuk target eksplorasi bor.', 'Peta Geologi 1:25.000 & Model Target Bor', 'primary', ARRAY['Eksplorasi Porfiri', 'Singkapan', 'Sampling'], 'https://images.unsplash.com/photo-1518384401463-d3876163c195?auto=format&fit=crop&w=1200&q=80', 0),
('proj-2', 'Karakterisasi Geokimia & Petrografi Formasi Batuan', 'Cekungan Jawa Timur', '5 Bulan', 'Analisis 45 preparasi thin section sayatan tipis untuk mengidentifikasi provenans tektonik serta fasa lempung XRD.', 'Atlas Petrografi & Laporan Provenans', 'secondary', ARRAY['Thin Section', 'Petrografi', 'XRD'], 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80', 1),
('proj-3', 'Studi Geohidrologi & Pemodelan Akuifer Air Tanah', 'Cekungan Bandung', '4 Bulan', 'Survei geolistrik konfigurasi Schlumberger di 28 titik sounding untuk delimitasi akuifer tertekan dan sumur resapan.', 'Peta Hidrogeologi & Penampang 2D', 'tertiary', ARRAY['Geolistrik', 'Schlumberger', 'Akuifer'], 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80', 2),
('proj-4', 'Pemetaan Geohazard & Mitigasi Longsor LiDAR', 'Jawa Barat', '6 Bulan', 'Pengolahan DEM resolusi tinggi dan pemodelan kestabilan lereng kritis untuk zonasi kerentanan gerakan tanah.', 'Peta Bahaya Longsor Skala 1:10.000', 'error', ARRAY['LiDAR', 'DEM', 'Geohazard'], 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', 3);

-- Certifications Seed
DELETE FROM public.certifications;
INSERT INTO public.certifications (id, title, issuer, year, description, credential_url, order_index) VALUES
('cert-1', 'POP (Pengawas Operasional Pertama)', 'ESDM • BNSP', '2023', 'Pengawasan keselamatan operasional minerba sesuai Kepmen ESDM.', '#', 0),
('cert-2', 'Basic Sea Survival & HUET', 'OPITO', '2022', 'Protokol keselamatan & evakuasi helikopter lapangan maritim.', '#', 1),
('cert-3', '3D Modeling Leapfrog Geo', 'Seequent', '2022', 'Pemodelan implisit domain litologi, sesar, dan kadar mineral.', '#', 2),
('cert-4', 'ArcGIS Mining & Spatial Database', 'Esri', '2021', 'Geodatabase spasial dan integrasi penginderaan jauh.', '#', 3),
('cert-5', 'Petrografi Alterasi Hidrotermal', 'IAGI', '2021', 'Spesiasi mineral alterasi dan paragenesis urat bijih.', '#', 4),
('cert-6', 'Wellsite & Mudlogging Operations', 'AAPG', '2020', 'Evaluasi cuttings dan analisis tekanan gas sumur pemboran.', '#', 5);

-- Skills Seed
DELETE FROM public.skills;
INSERT INTO public.skills (id, category, icon_name, items, order_index) VALUES
('skill-1', 'Geologi Lapangan', 'terrain', ARRAY['Brunton Compass', 'Core Logging', 'Rock Sampling', 'Analisis Struktur'], 0),
('skill-2', 'Software & GIS', 'computer', ARRAY['Leapfrog Geo', 'ArcGIS Pro', 'QGIS', 'Micromine', 'ioGAS'], 1),
('skill-3', 'Laboratorium', 'biotech', ARRAY['Thin Section', 'Ore Microscopy', 'Spektroskopi XRF', 'Difraksi XRD'], 2),
('skill-4', 'Kepatuhan & K3', 'verified_user', ARRAY['KCMI & JORC 2012', 'Job Safety Analysis', 'Wilderness Safety'], 3);

-- Contact Messages Seed
DELETE FROM public.contact_messages;
INSERT INTO public.contact_messages (id, name, email, phone, subject, message, is_read, created_at) VALUES
('msg-1', 'Ir. Hendra Wijaya', 'hendra.wijaya@minera-group.co.id', '+62 811-2233-4455', 'Peluang Eksplorasi Cu-Au Kalimantan Tengah', 'Halo Ibu Ratna, kami sedang merencanakan kampanye pemetaan singkapan dan supervisi pemboran eksplorasi porfiri di Kalimantan Tengah untuk Q1 2026. Apakah Anda terbuka untuk diskusi teknis?', false, now() - INTERVAL '2 days'),
('msg-2', 'Dr. Bambang Priyono', 'bambang.priyono@georesearch.or.id', '+62 813-8899-7711', 'Undangan Kolaborasi Penelitian Sedimentologi', 'Selamat siang Bu Ratna, kami membaca abstrak riset Anda mengenai Formasi batuan di Cekungan Jawa Timur. Kami ingin mengajak kolaborasi penulisan makalah untuk simposium IAGI mendatang.', true, now() - INTERVAL '5 days');

-- Admin Credentials Seed (Default: admin / geolog2026)
INSERT INTO public.admin_credentials (id, username, password)
VALUES ('primary', 'admin', 'geolog2026')
ON CONFLICT (id) DO NOTHING;
