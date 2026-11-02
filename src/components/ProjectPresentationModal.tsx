'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project } from '@/lib/types';
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

interface ProjectPresentationModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectPresentationModal({
  project,
  onClose,
}: ProjectPresentationModalProps) {
  const { lang } = useLanguage();
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const docUrl = project?.document_url || '';
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

  // Reset page, zoom & error ONLY when project ID or docUrl changes (NEVER when totalPages changes!)
  useEffect(() => {
    setZoom(100);
    setCurrentPage(1);
    setDocError(null);
    if (docUrl) {
      setDocLoading(true);
    }
  }, [project?.id, docUrl]);

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

  if (!project) return null;

  const isEn = lang === 'en';

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

      let filename = project.document_name;
      if (!filename) {
        filename = `${project.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_paparan.pdf`;
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
      a.download = project.document_name || 'dokumen_paparan.pdf';
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

  const details = project.details || {};

  const objectives =
    details.objectives && details.objectives.length > 0
      ? details.objectives
      : isEn
      ? [
          `Comprehensive characterization of target formation and lithology for ${project.title}.`,
          `Define quantitative cut-offs that separate reservoir from non-reservoir facies.`,
          `Translate the integrated interpretation into field exploration recommendations.`,
        ]
      : [
          `Karakterisasi komprehensif formasi batuan dan litologi target untuk ${project.title}.`,
          `Menentukan parameter dan batas kuantitatif pemisah fasies prospek.`,
          `Menyusun rekomendasi teknis dan implikasi operasional eksplorasi lanjutan.`,
        ];

  const dataset =
    details.dataset && details.dataset.length > 0
      ? details.dataset
      : isEn
      ? [
          '3 exploration wells with complete petrophysical suites',
          '3D partial-stack seismic volumes & regional 2D sections',
          'Checkshot, well marker data, and core specimen samples',
        ]
      : [
          '3 sumur eksplorasi dengan log petrofisika lengkap',
          'Data seismik 3D partial-stack & penampang 2D regional',
          'Data checkshot, marker formasi, dan sampel batuan inti',
        ];

  const workflow =
    details.workflow && details.workflow.length > 0
      ? details.workflow
      : isEn
      ? [
          'Well log conditioning and petrophysical analysis',
          'Rock physics analysis and elastic sensitivity testing',
          'Well-to-seismic tie and wavelet extraction',
          'Seismic stratigraphic framework & structural interpretation',
          'Simultaneous and extended elastic impedance inversion',
          'Reservoir property prediction & quality control',
        ]
      : [
          'Well log conditioning dan petrophysical analysis',
          'Rock physics analysis dan uji sensitivitas elastis',
          'Well-to-seismic tie dan ekstraksi wavelet',
          'Interpretasi kerangka seismik stratigrafi & struktur',
          'Simultaneous and extended elastic impedance inversion',
          'Prediksi sebaran properti reservoir & quality control',
        ];

  const methods =
    details.methods && details.methods.length > 0
      ? details.methods
      : [
          'Seismic stratigraphy & sequence boundary analysis',
          'Rock physics modeling & elastic impedance',
          'Acoustic impedance & Vp/Vs inversion',
          'Evaluasi fasies litologi dan saturasi fluida',
        ];

  const results =
    details.results && details.results.length > 0
      ? details.results
      : [
          'Integrasi data geologi lapangan, petrofisika sumur, dan penampang seismik komprehensif.',
          'Pemodelan dan evaluasi 6 volume atribut elastis properti reservoir utama.',
          'Korelasi quality control inversi tinggi mencapai akurasi optimal (R > 0.90).',
          `Deliverable terverifikasi: ${project.deliverable || 'Peta Geologi & Laporan Akhir'}.`,
        ];

  const keyFindings =
    details.key_findings && details.key_findings.length > 0
      ? details.key_findings
      : [
          'Identifikasi zona prospek utama dengan respon anomali elastis yang konsisten.',
          'Rekomendasi teknis menargetkan tutupan struktur dan kualitas reservoir terbaik.',
        ];

  const softwareUsed =
    details.software_used && details.software_used.length > 0
      ? details.software_used
      : ['Petrel', 'Hampson-Russell', 'Interactive Petrophysics', 'Python', 'ArcGIS'];

  const docDescription =
    details.doc_description ||
    (isEn
      ? 'Complete technical documentation documenting the integrated geological, petrophysical, inversion, and seismic-stratigraphic workflow.'
      : 'Dokumentasi komprehensif alur kerja survei lapangan, pengolahan data geologi/geofisika, interpretasi petrofisika, dan rekomendasi teknis eksplorasi.');

  const docTags =
    details.doc_tags && details.doc_tags.length > 0
      ? details.doc_tags
      : project.tags && project.tags.length > 0
      ? project.tags
      : ['Dokumen Teknis', 'Presentasi Proyek', 'Studi Kasus'];

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
              fill="none"
              stroke="rgba(224, 122, 56, 0.45)"
              strokeWidth="1.5"
            />
            <path
              d="M0,65 C180,45 320,80 520,60 C720,40 880,75 1000,55"
              fill="none"
              stroke="rgba(255, 182, 140, 0.3)"
              strokeWidth="1.5"
            />
            <path
              d="M0,95 C140,75 360,110 540,90 C720,70 860,105 1000,85"
              fill="none"
              stroke="rgba(224, 122, 56, 0.4)"
              strokeWidth="1.5"
            />
            <path
              d="M0,130 C160,110 340,145 520,125 C700,105 840,140 1000,120"
              fill="none"
              stroke="rgba(255, 182, 140, 0.25)"
              strokeWidth="1.5"
            />
            <path
              d="M0,165 C200,145 380,180 560,160 C740,140 900,175 1000,155"
              fill="none"
              stroke="rgba(224, 122, 56, 0.35)"
              strokeWidth="1.5"
            />
            <path
              d="M0,200 C150,180 350,215 530,195 C710,175 870,210 1000,190"
              fill="none"
              stroke="rgba(255, 182, 140, 0.3)"
              strokeWidth="1.5"
            />
          </svg>

          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-lg bg-surface-container/90 hover:bg-surface-container text-on-surface border border-surface-container-high flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
            title={isEn ? 'Close (Esc)' : 'Tutup (Esc)'}
          >
            <span className="material-symbols-outlined text-lg font-bold">close</span>
          </button>

          {/* Duration Badge */}
          <div className="z-10 mt-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-primary-fixed bg-black/45 backdrop-blur-xs px-3 py-1 rounded-md border border-primary/30">
              <span className="material-symbols-outlined text-xs text-primary">schedule</span>
              <span>{project.duration || (isEn ? 'PROJECT TIMELINE' : 'PENGALAMAN PROYEK')}</span>
            </span>
          </div>
        </div>

        {/* Modal Main Content Body */}
        <div className="p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8 bg-surface-container-lowest">
          {/* Title & Description Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
              <span className="flex items-center gap-1 text-primary font-semibold">
                <span className="material-symbols-outlined text-sm">pin_drop</span>
                {project.location}
              </span>
              <span>&bull;</span>
              <span>{project.duration}</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight leading-snug">
              {project.title}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-on-surface-variant leading-relaxed max-w-4xl">
              {project.description}
            </p>

            {/* Keyword / Category Pills & Deliverable */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {project.deliverable && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-primary-fixed/30 text-primary border border-primary-fixed">
                  <span className="material-symbols-outlined text-sm">task_alt</span>
                  <span>Deliverable: {project.deliverable}</span>
                </span>
              )}

              {project.tags &&
                project.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono text-on-surface-variant bg-surface-container border border-surface-container-high"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>

          {/* Section 1: Objectives & Dataset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-2">
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>{isEn ? 'OBJECTIVES' : 'TUJUAN STUDI'}</span>
              </h3>
              <ul className="space-y-2.5">
                {objectives.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-on-surface leading-relaxed"
                  >
                    <span className="text-primary font-bold select-none text-base leading-none">
                      &minus;
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>DATASET</span>
              </h3>
              <ul className="space-y-2.5">
                {dataset.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-on-surface leading-relaxed"
                  >
                    <span className="text-primary font-bold select-none text-base leading-none">
                      &minus;
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 2: Workflow & Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-2">
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>{isEn ? 'WORKFLOW' : 'ALUR KERJA'}</span>
              </h3>
              <ol className="space-y-2.5">
                {workflow.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-xs sm:text-sm text-on-surface leading-relaxed"
                  >
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded shrink-0 select-none">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>{isEn ? 'METHODS' : 'METODE ANALISIS'}</span>
              </h3>
              <ul className="space-y-2.5">
                {methods.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-on-surface leading-relaxed"
                  >
                    <span className="text-primary font-bold select-none text-base leading-none">
                      &minus;
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 3: Results & Key Findings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-2">
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>{isEn ? 'RESULTS' : 'HASIL ANALISIS'}</span>
              </h3>
              <ul className="space-y-2.5">
                {results.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-on-surface leading-relaxed"
                  >
                    <span className="text-primary font-bold select-none text-base leading-none">
                      &minus;
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>{isEn ? 'KEY FINDINGS' : 'TEMUAN KUNCI'}</span>
              </h3>
              <ul className="space-y-2.5">
                {keyFindings.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-on-surface leading-relaxed"
                  >
                    <span className="text-primary font-bold select-none text-base leading-none">
                      &minus;
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 4: Software Used */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span>{isEn ? 'SOFTWARE USED' : 'SOFTWARE YANG DIGUNAKAN'}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {softwareUsed.map((soft, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium border border-surface-container-high bg-surface-container text-on-surface hover:border-primary/40 transition-colors shadow-2xs"
                >
                  {soft}
                </span>
              ))}
            </div>
          </div>

          {/* Section 5: Project Document & Single-Slide Presentation Viewer (Powered by react-pdf) - Rendered only when document exists */}
          {Boolean(docUrl) && (
            <div className="space-y-4 pt-6 border-t border-surface-container-high">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>{isEn ? 'PROJECT DOCUMENT' : 'DOKUMEN PAPARAN PROYEK'}</span>
                </h3>
                <p className="text-xs sm:text-sm font-bold text-on-surface pt-1">
                  {isEn
                    ? 'Explore the complete technical project documentation.'
                    : 'Jelajahi dokumentasi teknis lengkap dan paparan presentasi proyek.'}
                </p>
                <p className="text-xs text-on-surface-variant pt-0.5 leading-relaxed">
                  {docDescription}
                </p>
              </div>

              {/* Document Badges */}
              {docTags && docTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {docTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-mono font-medium border border-primary-fixed bg-primary-fixed/30 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

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
                  {/* 1. react-pdf Document & Page View */}
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

                {/* Exact Bottom Toolbar: Previous, Page X / Y, Next, Zoom, Fullscreen, Open, Download */}
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
