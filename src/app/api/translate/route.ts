import { NextResponse } from 'next/server';

// Server-side in-memory cache to prevent duplicate external requests
const translationCache = new Map<string, string>();

// Fallback dictionary for common geological terms if network fails or offline
const geologicalGlossary: Record<string, string> = {
  'S1 Teknik Geologi': 'B.Eng. in Geological Engineering',
  'Tersedia untuk Proyek & Konsultansi': 'Available for Field Projects & Consulting',
  'K3 & POP Minerba ESDM': 'OHS & ESDM Mining Operational Supervisor (POP)',
  'Sekarang': 'Present',
  'Bulan': 'Months',
  'Tahun': 'Years',
  'Pengeboran': 'Drilling',
  'Pemetaan': 'Mapping',
  'Alterasi Hidrotermal': 'Hydrothermal Alteration',
  'Geologi Lapangan': 'Field Geology',
  'Laboratorium & Petrografi': 'Laboratory & Petrography',
  'Perangkat Lunak & GIS': 'Software & GIS',
  'K3 & Regulasi Tambang': 'HSE & Mining Compliance',
};

async function translateSingle(text: string, from = 'id', to = 'en'): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  // Check glossary
  if (geologicalGlossary[trimmed]) {
    return geologicalGlossary[trimmed];
  }

  // Check in-memory cache
  const cacheKey = `${from}:${to}:${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((item: any) => (item && item[0]) || '').join('');
        if (translated) {
          translationCache.set(cacheKey, translated);
          return translated;
        }
      }
    }
  } catch (err) {
    // Network or timeout failure, return fallback or original
  }

  return text;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { texts, from = 'id', to = 'en' } = body;

    if (!Array.isArray(texts)) {
      return NextResponse.json({ error: 'texts must be an array' }, { status: 400 });
    }

    const uniqueTexts = Array.from(new Set(texts.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)));

    // Process translations in chunks of 8 to avoid overwhelming external API
    const translations: Record<string, string> = {};
    const chunkSize = 8;

    for (let i = 0; i < uniqueTexts.length; i += chunkSize) {
      const chunk = uniqueTexts.slice(i, i + chunkSize);
      const results = await Promise.all(chunk.map((t) => translateSingle(t, from, to)));
      chunk.forEach((t, index) => {
        translations[t] = results[index];
      });
    }

    return NextResponse.json({ translations });
  } catch (err) {
    console.error('Translation route error:', err);
    return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
  }
}
