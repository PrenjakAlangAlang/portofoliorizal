import { jsPDF } from 'jspdf';

/**
 * Converts a PPTX or PPT file (File object or ArrayBuffer) into a multi-page PDF Blob.
 * Uses PptxViewJS and JSZip in the browser to parse slides and jsPDF to compile them.
 */
export async function convertPptxToPdf(fileOrBuffer: File | ArrayBuffer): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('PPT to PDF conversion must be run in the browser');
  }

  const loadScript = (src: string) => {
    return new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if ((existing as any).dataset.loaded === 'true') {
          resolve();
        } else {
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
        }
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        (script as any).dataset.loaded = 'true';
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  };

  // 1. Ensure JSZip is loaded
  if (!(window as any).JSZip) {
    await loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
  }

  // 2. Optional Chart.js
  try {
    if (!(window as any).Chart) {
      await loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js');
    }
  } catch {
    // optional
  }

  // 3. Ensure PptxViewJS is loaded
  if (!(window as any).PptxViewJS) {
    await loadScript('https://cdn.jsdelivr.net/npm/pptxviewjs/dist/PptxViewJS.min.js');
  }

  const PptxViewJS = (window as any).PptxViewJS;
  if (!PptxViewJS) {
    throw new Error('PptxViewJS library could not be loaded');
  }

  // Create an offscreen rendering canvas (1280x720 HD for optimal speed & quality)
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;

  const viewer = new PptxViewJS.PPTXViewer({ canvas });

  let bufferToLoad: ArrayBuffer;
  if (fileOrBuffer instanceof File) {
    bufferToLoad = await fileOrBuffer.arrayBuffer();
  } else {
    bufferToLoad = fileOrBuffer;
  }

  await viewer.loadFile(bufferToLoad);
  await viewer.render(canvas);

  const totalSlides = Math.max(1, viewer.getSlideCount?.() || 1);

  // Initialize jsPDF in landscape (16:9 presentation format)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: [1280, 720],
    compress: true,
  });

  for (let i = 0; i < totalSlides; i++) {
    await viewer.goToSlide?.(i);
    await viewer.render?.(canvas);

    const imgData = canvas.toDataURL('image/jpeg', 0.82);
    if (i > 0) {
      pdf.addPage([1280, 720], 'landscape');
    }
    pdf.addImage(imgData, 'JPEG', 0, 0, 1280, 720, undefined, 'FAST');
  }

  return pdf.output('blob');
}
