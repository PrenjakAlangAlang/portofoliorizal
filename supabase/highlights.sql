-- =======================================================
-- Highlights Table (Pencapaian & Sorotan)
-- Jalankan di SQL Editor Supabase jika ingin membuat tabel terpisah
-- =======================================================

CREATE TABLE IF NOT EXISTS public.highlights (
  id TEXT PRIMARY KEY DEFAULT concat('hl-', gen_random_uuid()),
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on highlights"
  ON public.highlights FOR SELECT
  USING (true);

CREATE POLICY "Allow anon insert/update/delete on highlights"
  ON public.highlights FOR ALL
  USING (true)
  WITH CHECK (true);
