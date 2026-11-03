/**
 * Reusable file upload helper with real-time XMLHttpRequest progress (0% to 100%).
 * Uses Pre-Signed URLs to upload directly to Supabase Storage, bypassing Vercel's
 * 4.5 MB Serverless Function payload limit (HTTP 413: FUNCTION_PAYLOAD_TOO_LARGE).
 */
export async function uploadFileWithProgress(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; fileName: string }> {
  // Step 1: Request a direct pre-signed upload URL from the server
  try {
    const signedRes = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get-signed-url',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
      }),
    });

    const signedData = await signedRes.json();
    if (!signedRes.ok) {
      throw new Error(signedData.error || 'Gagal memvalidasi unggahan berkas.');
    }

    if (signedData.directUpload && signedData.signedUrl) {
      // Step 2: Upload directly to Supabase Storage using XMLHttpRequest with progress
      return new Promise<{ url: string; fileName: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('cacheControl', '3600');
        formData.append('', file, signedData.fileName);

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && e.total > 0) {
            const percent = Math.min(100, Math.max(0, Math.round((e.loaded / e.total) * 100)));
            onProgress?.(percent);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            onProgress?.(100);
            resolve({
              url: signedData.publicUrl,
              fileName: signedData.fileName,
            });
          } else {
            let errMsg = `Gagal mengunggah berkas ke storage (${xhr.status})`;
            try {
              const resJson = JSON.parse(xhr.responseText);
              if (resJson.message) errMsg = resJson.message;
            } catch {
              // ignore
            }
            reject(new Error(errMsg));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Koneksi terputus saat mengunggah berkas. Periksa jaringan Anda.'));
        });

        xhr.addEventListener('timeout', () => {
          reject(new Error('Waktu unggah habis (timeout). Berkas mungkin terlalu besar atau koneksi lambat.'));
        });

        xhr.open('PUT', signedData.signedUrl);
        xhr.timeout = 300000; // 5 menit
        xhr.send(formData);
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('melebihi batas')) {
      throw err;
    }
    console.warn('Pre-signed URL direct upload negotiation failed, falling back to server route:', err);
  }

  // Fallback: Upload through /api/admin/upload route via standard FormData
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && e.total > 0) {
        const percent = Math.min(100, Math.max(0, Math.round((e.loaded / e.total) * 100)));
        onProgress?.(percent);
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.url) {
          onProgress?.(100);
          resolve(data);
        } else {
          reject(new Error(data.error || `Gagal mengunggah berkas (${xhr.status})`));
        }
      } catch {
        reject(
          new Error(
            xhr.status === 413
              ? 'Ukuran berkas melebihi batas yang diizinkan server host (Maks. 50 MB).'
              : `Gagal mengunggah berkas (${xhr.status})`
          )
        );
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Koneksi terputus saat mengunggah berkas. Periksa jaringan Anda.'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new Error('Waktu unggah habis (timeout). Berkas mungkin terlalu besar atau koneksi lambat.'));
    });

    xhr.open('POST', '/api/admin/upload');
    xhr.timeout = 300000; // 5 menit timeout
    xhr.send(formData);
  });
}
