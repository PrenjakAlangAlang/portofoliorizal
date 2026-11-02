import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { isSupabaseConfigured, getAdminSupabase } from '@/lib/supabase';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // Limit maximum file size to 100 MB
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `Ukuran berkas (${sizeMb} MB) melebihi batas maksimal 100 MB.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and create unique timestamp
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}_${cleanName}`;

    // 1. If Supabase is configured, try Supabase Storage first
    if (isSupabaseConfigured()) {
      const client = getAdminSupabase();
      if (client) {
        try {
          const bucketName = 'portfolio';

          // Upload to Supabase Storage bucket
          let { error: uploadError } = await client.storage
            .from(bucketName)
            .upload(fileName, buffer, {
              contentType: file.type || 'application/octet-stream',
              upsert: true,
            });

          // If bucket is missing, attempt to auto-create and retry
          if (uploadError && uploadError.message.toLowerCase().includes('bucket not found')) {
            try {
              await client.storage.createBucket(bucketName, { public: true });
              const retry = await client.storage
                .from(bucketName)
                .upload(fileName, buffer, {
                  contentType: file.type || 'application/octet-stream',
                  upsert: true,
                });
              uploadError = retry.error;
            } catch (createErr) {
              // ignore and fallback
            }
          }

          if (!uploadError) {
            const { data: publicUrlData } = client.storage
              .from(bucketName)
              .getPublicUrl(fileName);

            if (publicUrlData?.publicUrl) {
              return NextResponse.json({
                success: true,
                url: publicUrlData.publicUrl,
                fileName,
              });
            }
          } else {
            console.warn('Supabase storage upload error, falling back to local:', uploadError.message);
          }
        } catch (storageErr) {
          console.warn('Supabase storage error:', storageErr);
        }
      }
    }

    // 2. Local fallback storage in public/uploads/
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, buffer);

    const localUrl = `/uploads/${fileName}`;
    return NextResponse.json({
      success: true,
      url: localUrl,
      fileName,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengunggah file';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
