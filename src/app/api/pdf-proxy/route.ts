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

    const rangeHeader = request.headers.get('range');

    // 1. Handle local files stored in public/uploads
    let cleanLocalPath: string | null = null;
    if (targetUrl.startsWith('/uploads/')) {
      cleanLocalPath = targetUrl.replace(/^\/uploads\//, '');
    } else if (targetUrl.startsWith('uploads/')) {
      cleanLocalPath = targetUrl.replace(/^uploads\//, '');
    } else if (targetUrl.includes('/uploads/')) {
      try {
        const parsed = new URL(targetUrl);
        if (parsed.pathname.startsWith('/uploads/')) {
          cleanLocalPath = parsed.pathname.replace(/^\/uploads\//, '');
        }
      } catch {
        // Not a URL string, ignore
      }
    }

    if (cleanLocalPath) {
      const filePath = path.join(process.cwd(), 'public', 'uploads', cleanLocalPath);
      const stat = await fs.stat(filePath);

      const ext = path.extname(cleanLocalPath).toLowerCase();
      const contentType =
        ext === '.pptx'
          ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          : ext === '.ppt'
          ? 'application/vnd.ms-powerpoint'
          : 'application/pdf';

      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunkSize = end - start + 1;

        const fileHandle = await fs.open(filePath, 'r');
        const buffer = Buffer.alloc(chunkSize);
        await fileHandle.read(buffer, 0, chunkSize, start);
        await fileHandle.close();

        return new Response(buffer, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': String(chunkSize),
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
          },
        });
      }

      const fileBuffer = await fs.readFile(filePath);
      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(stat.size),
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
        },
      });
    }

    // 2. Handle remote URLs (e.g. Supabase Storage) with Range & Streaming
    const fetchHeaders: HeadersInit = {};
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    const remoteRes = await fetch(targetUrl, {
      headers: fetchHeaders,
    });

    if (!remoteRes.ok && remoteRes.status !== 206) {
      return NextResponse.json(
        { error: `Gagal mengunduh berkas: ${remoteRes.statusText}` },
        { status: remoteRes.status }
      );
    }

    const resHeaders = new Headers();
    resHeaders.set('Content-Type', remoteRes.headers.get('content-type') || 'application/pdf');
    resHeaders.set('Accept-Ranges', 'bytes');
    resHeaders.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=86400');

    if (remoteRes.headers.get('content-range')) {
      resHeaders.set('Content-Range', remoteRes.headers.get('content-range')!);
    }
    if (remoteRes.headers.get('content-length')) {
      resHeaders.set('Content-Length', remoteRes.headers.get('content-length')!);
    }

    // Stream the response directly to client without buffering in memory
    return new Response(remoteRes.body, {
      status: remoteRes.status,
      headers: resHeaders,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching document';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
