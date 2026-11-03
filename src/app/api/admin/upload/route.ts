import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { isSupabaseConfigured, getAdminSupabase } from '@/lib/supabase';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for large uploads

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB (Batas Supabase Free Tier)

export async function POST(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';

    // Direct Pre-Signed URL Generator for large files (bypasses Vercel Serverless 4.5MB request limit)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (body.action === 'get-signed-url') {
        const fileSize = Number(body.fileSize || 0);
        if (fileSize > MAX_FILE_SIZE) {
          const sizeMb = (fileSize / (1024 * 1024)).toFixed(1);
          return NextResponse.json(
            { error: `Ukuran berkas (${sizeMb} MB) melebihi batas maksimal 50 MB.` },
            { status: 400 }
          );
        }

        if (isSupabaseConfigured()) {
          const client = getAdminSupabase();
          if (client) {
            const bucketName = 'portfolio';
            const cleanName = (body.fileName || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${Date.now()}_${cleanName}`;

            let { data, error } = await client.storage
              .from(bucketName)
              .createSignedUploadUrl(fileName);

            if (error && error.message?.toLowerCase().includes('bucket not found')) {
              try {
                await client.storage.createBucket(bucketName, {
                  public: true,
                  fileSizeLimit: MAX_FILE_SIZE,
                });
                const retry = await client.storage
                  .from(bucketName)
                  .createSignedUploadUrl(fileName);
                data = retry.data;
                error = retry.error;
              } catch (createErr) {
                console.warn('Failed to auto-create bucket for signed url:', createErr);
              }
            }

            if (!error && data?.signedUrl) {
              const { data: publicData } = client.storage
                .from(bucketName)
                .getPublicUrl(fileName);

              return NextResponse.json({
                success: true,
                directUpload: true,
                signedUrl: data.signedUrl,
                path: data.path,
                token: data.token,
                publicUrl: publicData.publicUrl,
                fileName,
              });
            } else if (error) {
              console.warn('createSignedUploadUrl error:', error);
            }
          }
        }

        return NextResponse.json({ directUpload: false });
      }
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // Limit maximum file size to 50 MB
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `Ukuran berkas (${sizeMb} MB) melebihi batas maksimal 50 MB.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and create unique timestamp
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}_${cleanName}`;

    let lastSupabaseError = '';

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

          // If bucket is missing, attempt to auto-create with 50MB limit and retry
          if (uploadError && uploadError.message?.toLowerCase().includes('bucket not found')) {
            try {
              await client.storage.createBucket(bucketName, {
                public: true,
                fileSizeLimit: MAX_FILE_SIZE,
              });
              const retry = await client.storage
                .from(bucketName)
                .upload(fileName, buffer, {
                  contentType: file.type || 'application/octet-stream',
                  upsert: true,
                });
              uploadError = retry.error;
            } catch (createErr) {
              console.warn('Failed to auto-create bucket:', createErr);
            }
          }

          // If error indicates file size limit reached on bucket, attempt to update bucket limit and retry
          if (
            uploadError &&
            (uploadError.message?.toLowerCase().includes('exceeded') ||
              uploadError.message?.toLowerCase().includes('size') ||
              uploadError.message?.toLowerCase().includes('413'))
          ) {
            try {
              await client.storage.updateBucket(bucketName, {
                public: true,
                fileSizeLimit: MAX_FILE_SIZE,
              });
              const retry = await client.storage
                .from(bucketName)
                .upload(fileName, buffer, {
                  contentType: file.type || 'application/octet-stream',
                  upsert: true,
                });
              uploadError = retry.error;
            } catch (updateErr) {
              console.warn('Failed to update bucket limit:', updateErr);
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
            lastSupabaseError = uploadError.message;
            console.warn('Supabase storage upload error, falling back to local storage:', uploadError.message);
          }
        } catch (storageErr) {
          lastSupabaseError = storageErr instanceof Error ? storageErr.message : String(storageErr);
          console.warn('Supabase storage error:', storageErr);
        }
      }
    }

    // 2. Local fallback storage in public/uploads/
    try {
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
    } catch (localErr) {
      console.error('Local fallback write error:', localErr);
      const detail = lastSupabaseError
        ? `Supabase: ${lastSupabaseError}. Local: ${localErr instanceof Error ? localErr.message : 'Gagal menulis berkas'}`
        : localErr instanceof Error
        ? localErr.message
        : 'Gagal menyimpan berkas';
      return NextResponse.json({ error: `Gagal mengunggah berkas: ${detail}` }, { status: 500 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengunggah file';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
