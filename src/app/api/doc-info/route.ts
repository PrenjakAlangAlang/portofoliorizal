import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    let buffer: Buffer;

    // 1. Check local upload files
    if (targetUrl.startsWith('/uploads/')) {
      const sanitized = targetUrl.replace(/^\/+/, '').replace(/\.\./g, '');
      const filePath = path.join(process.cwd(), 'public', sanitized);
      buffer = await fs.readFile(filePath);
    } else {
      // 2. Remote URL (Supabase storage or external)
      const res = await fetch(targetUrl);
      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch file: ${res.statusText}` },
          { status: res.status }
        );
      }
      const arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Determine file type
    const lower = targetUrl.toLowerCase();
    const isPptx = lower.endsWith('.pptx') || lower.includes('.pptx');
    const isPdf = lower.endsWith('.pdf') || lower.includes('.pdf');

    let totalPages = 1;

    if (isPptx) {
      // PPTX is a ZIP container. In ZIP central directory, all filenames are plaintext ASCII.
      // Slide files are named ppt/slides/slide1.xml, ppt/slides/slide2.xml, ...
      const content = buffer.toString('binary');
      const matches = content.match(/ppt\/slides\/slide(\d+)\.xml/gi);
      if (matches && matches.length > 0) {
        const nums = matches.map((m) => {
          const match = m.match(/slide(\d+)\.xml/i);
          return match ? parseInt(match[1], 10) : 0;
        });
        totalPages = Math.max(...nums, matches.length);
      } else {
        // Fallback: Check for <Slides>N</Slides> metadata in docProps/app.xml
        const metaMatch = content.match(/<Slides>(\d+)<\/Slides>/i);
        if (metaMatch) {
          totalPages = parseInt(metaMatch[1], 10);
        }
      }
    } else if (isPdf) {
      // Simple PDF page count estimate if needed: count /Type /Page (excluding /Pages)
      const content = buffer.toString('binary');
      const matches = content.match(/\/Type\s*\/Page\b/g);
      if (matches) {
        totalPages = matches.length;
      }
    }

    return NextResponse.json({
      success: true,
      totalPages: Math.max(1, totalPages),
      isPpt: isPptx || lower.endsWith('.ppt') || lower.includes('.ppt'),
      isPdf,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error inspecting document';
    return NextResponse.json({ error: msg, totalPages: 1 }, { status: 500 });
  }
}
