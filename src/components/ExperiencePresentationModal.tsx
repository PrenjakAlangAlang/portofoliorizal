'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Experience, parseResponsibilities } from '@/lib/types';
import { useLanguage } from '@/context/LanguageContext';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker for react-pdf
if (typeof window !== 'undefined') {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      '/pdf.worker.min.mjs',
      window.location.origin
    ).toString();
  } catch {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
}

// Cache for converted PPT blob URLs across modal opens
const convertedPdfCache = new Map<string, string>();

interface ExperiencePresentationModalProps {
  experience: Experience | null;
  onClose: () => void;
}

export default function ExperiencePresentationModal({
  experience,
  onClose,
}: ExperiencePresentationModalProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const docUrl = experience?.document_url || '';
  const isPpt =
    Boolean(docUrl) &&
    (docUrl.toLowerCase().endsWith('.ppt') ||
      docUrl.toLowerCase().endsWith('.pptx') ||
      docUrl.toLowerCase().includes('.ppt') ||
      docUrl.toLowerCase().includes('.pptx'));

  // Compute initial PDF url synchronously to prevent initial render lag
  const getInitialPdfUrl = () => {
    if (!docUrl) return '';
    if (isPpt) {
      return convertedPdfCache.get(docUrl) || '';
    }
    if (docUrl.startsWith('blob:') || docUrl.startsWith('data:')) return docUrl;
    return `/api/pdf-proxy?url=${encodeURIComponent(docUrl)}`;
  };

  // Single slide / page navigation states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [docLoading, setDocLoading] = useState(true);
  const [docError, setDocError] = useState<string | null>(null);
  const [effectivePdfUrl, setEffectivePdfUrl] = useState<string>(getInitialPdfUrl);
  const [convertingPpt, setConvertingPpt] = useState(false);
  const [pageWidth, setPageWidth] = useState<number>(880);

  const viewerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const backdropMouseDownRef = useRef<boolean>(false);

  // Ref for totalPages so keyboard navigation never forces effect resets
  const totalPagesRef = useRef<number>(totalPages);
  totalPagesRef.current = totalPages;

  // Auto-fit document page width to container and handle responsiveness
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const padding = cw < 640 ? 20 : 40;
        setPageWidth(Math.max(260, Math.min(1100, cw - padding)));
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Keyboard navigation (Escape, ArrowRight, ArrowLeft) - decoupled from state resets
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentPage((p) => Math.min(totalPagesRef.current, p + 1));
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Reset page, zoom & error ONLY when experience ID or docUrl changes (NEVER when totalPages changes!)
  useEffect(() => {
    setZoom(100);
    setCurrentPage(1);
    setDocError(null);
    if (docUrl) {
      setDocLoading(true);
    }
  }, [experience?.id, docUrl]);

  // Safety fallback: ensure loading spinner never hangs indefinitely
  useEffect(() => {
    if (!effectivePdfUrl) return;
    const timer = setTimeout(() => {
      setDocLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [effectivePdfUrl]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isFull);
      setTimeout(() => {
        if (containerRef.current) {
          const cw = containerRef.current.clientWidth;
          const padding = cw < 640 ? 20 : 40;
          setPageWidth(Math.max(260, Math.min(1100, cw - padding)));
        }
      }, 100);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Prepare PDF URL for react-pdf (converts PPT to PDF if needed)
  useEffect(() => {
    let isCancelled = false;

    if (!docUrl) {
      setEffectivePdfUrl('');
      setDocLoading(false);
      return;
    }

    if (isPpt) {
      if (convertedPdfCache.has(docUrl)) {
        setEffectivePdfUrl(convertedPdfCache.get(docUrl)!);
        setDocLoading(false);
        setConvertingPpt(false);
        return;
      }

      setConvertingPpt(true);
      setDocLoading(true);
      const convert = async () => {
        try {
          const { convertPptxToPdf } = await import('@/lib/ppt-to-pdf');
          const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(docUrl)}`;
          const res = await fetch(proxyUrl);
          if (!res.ok) throw new Error('Failed to fetch PPT');
          const buffer = await res.arrayBuffer();
          if (isCancelled) return;
          const pdfBlob = await convertPptxToPdf(buffer);
          if (isCancelled) return;
          const blobUrl = URL.createObjectURL(pdfBlob);
          convertedPdfCache.set(docUrl, blobUrl);
          setEffectivePdfUrl(blobUrl);
          setDocLoading(false);
        } catch (err) {
          console.warn('Could not convert PPT on the fly, routing proxy:', err);
          setEffectivePdfUrl(`/api/pdf-proxy?url=${encodeURIComponent(docUrl)}`);
        } finally {
          if (!isCancelled) setConvertingPpt(false);
        }
      };
      convert();
    } else {
      const url =
        docUrl.startsWith('blob:') || docUrl.startsWith('data:')
          ? docUrl
          : `/api/pdf-proxy?url=${encodeURIComponent(docUrl)}`;
      setEffectivePdfUrl(url);
    }

    return () => {
      isCancelled = true;
    };
  }, [docUrl, isPpt]);

  if (!experience) return null;

  const handlePrevSlide = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentPage((p) => (totalPages > 1 ? Math.min(totalPages, p + 1) : p + 1));
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(200, z + 15));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(50, z - 15));
  };

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleDownload = async () => {
    if (!docUrl || downloading) return;
    setDownloading(true);

    try {
      const res = await fetch(effectivePdfUrl || docUrl);
      if (!res.ok) throw new Error('Network error');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      let filename = experience.document_name;
      if (!filename) {
        filename = `${experience.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_dokumentasi.pdf`;
      }

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch {
      const a = document.createElement('a');
      a.href = docUrl;
      a.download = experience.document_name || 'dokumentasi_pengalaman.pdf';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenDoc = () => {
    if (effectivePdfUrl || docUrl) {
      window.open(effectivePdfUrl || docUrl, '_blank');
    }
  };

  // Determine responsibilities list (1 poin per baris)
  const responsibilitiesList = parseResponsibilities(
    experience.description,
    experience.responsibilities
  );

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto p-2 sm:p-4 md:p-6 flex justify-center items-start animate-in fade-in duration-200"
      onMouseDown={(e) => {
        backdropMouseDownRef.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && backdropMouseDownRef.current) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-5xl my-3 sm:my-6 bg-surface-container-lowest text-on-surface border border-surface-container-high rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all relative font-sans"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Geological Wave Top Banner */}
        <div className="relative w-full h-32 sm:h-36 md:h-44 bg-gradient-to-r from-[#241710] via-[#352115] to-[#1c120c] dark:from-[#191c20] dark:via-[#261d17] dark:to-[#17191d] border-b border-primary/25 flex flex-col justify-between p-4 sm:p-6 md:p-8 overflow-hidden select-none">
          <svg
            className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 240"
            preserveAspectRatio="none"
          >
            <path
              d="M0,35 C150,15 350,55 500,35 C650,15 850,50 1000,30 L1000,0 L0,0 Z"
              fill="rgba(217, 119, 6, 0.15)"
            />
            <path
              d="M0,80 C200,50 400,110 650,75 C850,45 950,90 1000,65 L1000,0 L0,0 Z"
              fill="rgba(180, 83, 9, 0.12)"
            />
            <path
              d="M0,140 C180,110 320,165 550,130 C780,95 900,150 1000,120 L1000,0 L0,0 Z"
              fill="rgba(146, 64, 14, 0.1)"
            />
          </svg>

          {/* Top metadata pill & close button */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wider uppercase text-amber-200/90 bg-amber-500/10 border border-amber-500/30 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              {isEn ? 'CAREER STRATIGRAPHY • WORK EXPERIENCE' : 'RIWAYAT KARIR • PENGALAMAN KERJA'}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-neutral-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup (Esc)"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          {/* Subtitle / Company banner info */}
          <div className="relative z-10 flex items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-mono text-amber-200/80 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">business</span>
                <span className="font-semibold text-white">{experience.company}</span>
                <span className="text-white/40">&bull;</span>
                <span>{experience.location}</span>
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400 bg-black/40 px-3 py-1 rounded-full border border-white/10">
              <span className="material-symbols-outlined text-xs">calendar_month</span>
              <span>{experience.period}</span>
            </span>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {/* Header Title & Badges */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight leading-tight">
                {experience.title}
              </h1>
              <span className="inline-flex sm:hidden font-mono text-xs text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded border border-primary/20 self-start">
                {experience.period}
              </span>
            </div>

            {/* Quick Meta Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-medium text-primary bg-primary/10 border border-primary/20">
                <span className="material-symbols-outlined text-sm">business</span>
                <span>{experience.company}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono text-on-surface-variant bg-surface-container border border-surface-container-high">
                <span className="material-symbols-outlined text-sm">pin_drop</span>
                <span>{experience.location}</span>
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono text-on-surface-variant bg-surface-container border border-surface-container-high">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>{experience.period}</span>
              </span>
            </div>
          </div>

          {/* Section: Uraian Tanggung Jawab (Description / Responsibilities) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span>{isEn ? 'JOB RESPONSIBILITIES & SCOPE' : 'URAIAN TANGGUNG JAWAB & LINGKUP KERJA'}</span>
            </h3>

            {responsibilitiesList.length > 0 ? (
              <ul className="space-y-2.5">
                {responsibilitiesList.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-on-surface leading-relaxed"
                  >
                    <span className="text-primary font-bold select-none text-base leading-none">
                      &bull;
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {isEn ? 'No description provided.' : 'Belum ada uraian tanggung jawab.'}
              </p>
            )}
          </div>

          {/* Section: Tags */}
          {experience.tags && experience.tags.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>TAGS</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {experience.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-mono text-on-surface-variant bg-surface-container border border-surface-container-high"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section: Skills (Keahlian & Perangkat Lunak) */}
          {experience.skills && experience.skills.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>{isEn ? 'SKILLS & COMPETENCIES' : 'KEAHLIAN & KOMPETENSI'}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {experience.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium border border-primary-fixed bg-primary-fixed/30 text-primary shadow-2xs hover:border-primary/50 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section: Dokumentasi Kerja (react-pdf) - Rendered ONLY when document exists */}
          {Boolean(docUrl) && (
            <div className="space-y-4 pt-6 border-t border-surface-container-high">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>{isEn ? 'WORK DOCUMENTATION' : 'DOKUMENTASI KERJA & LAPORAN'}</span>
                </h3>
                <p className="text-xs sm:text-sm font-bold text-on-surface pt-1">
                  {isEn
                    ? 'Explore presentation slides and technical documentation of this work.'
                    : 'Jelajahi slide paparan dan dokumentasi teknis dari pengalaman kerja ini.'}
                </p>
                {experience.document_name && (
                  <p className="text-xs font-mono text-primary pt-0.5">
                    Berkas: {experience.document_name}
                  </p>
                )}
              </div>

              {/* Single Slide Presentation Viewer Card (react-pdf) */}
              <div
                ref={viewerRef}
                className="rounded-2xl border border-neutral-300/80 dark:border-neutral-800 overflow-hidden bg-neutral-100 dark:bg-[#0c0f14] shadow-xl flex flex-col mt-3"
              >
                {/* Document Slide Viewport */}
                <div
                  ref={containerRef}
                  className={`relative w-full ${
                    isFullscreen
                      ? 'flex-1 h-full min-h-0'
                      : 'aspect-[16/10] min-h-[460px] sm:min-h-[560px] md:min-h-[620px]'
                  } bg-[#f0f3f6] dark:bg-[#080b0f] overflow-auto flex items-center justify-center p-3 sm:p-6 select-none`}
                >
                  {/* react-pdf Document & Page View */}
                  {effectivePdfUrl && (
                    <div
                      className="transition-transform duration-150 flex items-center justify-center max-w-full max-h-full"
                      style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'center center',
                      }}
                    >
                      <React.Suspense fallback={null}>
                        <Document
                          file={effectivePdfUrl}
                          onLoadSuccess={({ numPages }) => {
                            setTotalPages(numPages);
                            setDocLoading(false);
                            setDocError(null);
                          }}
                          onLoadError={(err) => {
                            console.warn('react-pdf document load error:', err);
                            setDocLoading(false);
                            setDocError('Gagal memproses dokumen dengan plugin react-pdf.');
                          }}
                          loading={null}
                          className="flex items-center justify-center"
                        >
                          <Page
                            pageNumber={currentPage}
                            width={pageWidth}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                            suspense={false}
                            className="rounded-xl shadow-2xl overflow-hidden border border-neutral-200 bg-white"
                            loading={null}
                            onRenderSuccess={() => setDocLoading(false)}
                            onLoadError={(err) => {
                              console.warn('react-pdf page load error:', err);
                              setDocLoading(false);
                            }}
                            onRenderError={(err) => {
                              console.warn('react-pdf page render error:', err);
                              setDocLoading(false);
                            }}
                          />
                        </Document>
                      </React.Suspense>
                    </div>
                  )}

                  {/* Loading State Spinner (Initial load or PPT conversion only) */}
                  {(docLoading || convertingPpt) && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-2xs flex flex-col items-center justify-center gap-2 z-20">
                      <span className="material-symbols-outlined animate-spin text-primary text-3xl">
                        progress_activity
                      </span>
                      <span className="text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200">
                        {convertingPpt
                          ? 'Mengonversi slide presentasi PPT ke format PDF...'
                          : 'Memuat berkas dokumen PDF...'}
                      </span>
                    </div>
                  )}

                  {/* Error Notice */}
                  {docError && (
                    <div className="absolute bottom-4 left-4 right-4 z-10 p-3 rounded-xl bg-error-container/80 text-error border border-error-container text-xs flex items-center justify-between">
                      <span>{docError}</span>
                      <button
                        type="button"
                        onClick={handleOpenDoc}
                        className="underline font-bold text-xs ml-2 cursor-pointer"
                      >
                        Buka Dokumen Langsung ↗
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Toolbar: Previous, Page X / Y, Next, Zoom, Fullscreen, Open, Download */}
                <div className="bg-white dark:bg-[#12151c] border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 shadow-inner">
                  {/* Left: Previous, Page Number, Next */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={(e) => handlePrevSlide(e)}
                      disabled={currentPage <= 1 || docLoading || convertingPpt}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1e24] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Slide/Halaman Sebelumnya (Panah Kiri)"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                      <span>Previous</span>
                    </button>

                    <div className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/90 text-neutral-800 dark:text-neutral-200 font-mono text-xs font-medium select-none min-w-[95px] text-center">
                      Page {currentPage} / {totalPages}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleNextSlide(e)}
                      disabled={currentPage >= totalPages || docLoading || convertingPpt}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1e24] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Slide/Halaman Berikutnya (Panah Kanan)"
                    >
                      <span>Next</span>
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>

                  {/* Middle: Divider + Zoom Controls */}
                  <div className="flex items-center gap-2">
                    <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 hidden sm:block"></div>

                    <button
                      type="button"
                      onClick={handleZoomOut}
                      className="w-8 h-8 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1e24] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors flex items-center justify-center font-bold text-sm shadow-2xs font-mono cursor-pointer"
                      title="Zoom Out"
                    >
                      &minus;
                    </button>

                    <button
                      type="button"
                      onClick={() => setZoom(100)}
                      className="px-2.5 h-8 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1e24] text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200 flex items-center justify-center min-w-[54px] shadow-2xs cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="Reset Zoom ke 100%"
                    >
                      {zoom}%
                    </button>

                    <button
                      type="button"
                      onClick={handleZoomIn}
                      className="w-8 h-8 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1e24] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors flex items-center justify-center font-bold text-sm shadow-2xs font-mono cursor-pointer"
                      title="Zoom In"
                    >
                      &#43;
                    </button>
                  </div>

                  {/* Right: Divider + Fullscreen, Open PDF, Download */}
                  <div className="flex items-center gap-2">
                    <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 hidden sm:block"></div>

                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="px-3 h-8 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1e24] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Layar Penuh"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                      </span>
                      <span>Fullscreen</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenDoc}
                      className="px-3 h-8 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1e24] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      title="Buka Dokumen PDF di Tab Baru"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      <span>Open PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={downloading}
                      className="px-3.5 h-8 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1e24] hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
                      title="Unduh Dokumen PDF"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      <span>{downloading ? 'Downloading...' : 'Download'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
