/**
 * Reusable file upload helper with real-time XMLHttpRequest progress (0% to 100%).
 */
export function uploadFileWithProgress(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; fileName: string }> {
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
              ? 'Ukuran berkas melebihi batas yang diizinkan server (Maks. 50 MB).'
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
    xhr.timeout = 300000; // 5 menit timeout untuk berkas hingga 50 MB
    xhr.send(formData);
  });
}
