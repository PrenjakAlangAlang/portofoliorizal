'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project } from '@/lib/types';

interface ProjectPresentationModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectPresentationModal({
  project,
  onClose,
}: ProjectPresentationModalProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset zoom when project changes
    setZoom(100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!project) return null;

  const docUrl = project.document_url || '';
  const isPdf = docUrl.toLowerCase().endsWith('.pdf') || docUrl.includes('.pdf');
  const isPpt =
    docUrl.toLowerCase().endsWith('.ppt') ||
    docUrl.toLowerCase().endsWith('.pptx') ||
    docUrl.includes('.ppt');

  const handleZoomIn = () => {
    setZoom((z) => Math.min(200, z + 15));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(50, z - 15));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleDownload = async () => {
    if (!docUrl || downloading) return;
    setDownloading(true);

    try {
      // Fetch the file as blob to force browser direct download (bypasses cross-origin download restrictions)
      const res = await fetch(docUrl);
      if (!res.ok) throw new Error('Network error');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Determine proper file name with extension
      let filename = project.document_name;
      if (!filename) {
        const ext = isPdf ? '.pdf' : isPpt ? '.pptx' : '';
        filename = `${project.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_paparan${ext}`;
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
      // Fallback: direct anchor trigger
      const a = document.createElement('a');
      a.href = docUrl;
      a.download = project.document_name || 'dokumen_paparan';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenDoc = () => {
    if (docUrl) {
      window.open(docUrl, '_blank');
    }
  };

  // Determine iframe source
  const getViewerUrl = () => {
    if (!docUrl) return null;
    if (isPdf) {
      // Direct PDF embed
      return `${docUrl}#zoom=${zoom}`;
    }
    if (isPpt) {
      // Office Online Viewer or Google Docs Viewer
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(docUrl)}`;
    }
    // General document via Google Docs Viewer
    return `https://docs.google.com/viewer?url=${encodeURIComponent(docUrl)}&embedded=true`;
  };

  const viewerUrl = getViewerUrl();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between items-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Bar Header */}
      <div className="w-full max-w-6xl flex items-center justify-between text-white pb-3 pt-1 border-b border-white/10">
        <div className="flex items-center gap-3 truncate">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-xl">
              {isPdf ? 'picture_as_pdf' : isPpt ? 'slideshow' : 'description'}
            </span>
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                {project.title}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/20 text-primary-fixed border border-primary/40 uppercase">
                {isPdf ? 'PDF Presentation' : isPpt ? 'PPT Slide' : 'Project Overview'}
              </span>
            </div>
            <p className="text-[11px] text-white/60 truncate font-mono">
              {project.location} &bull; {project.duration}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors ml-4 flex-shrink-0"
          title="Tutup (Esc)"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Main Presentation / Slide Display */}
      <div
        ref={containerRef}
        className="w-full max-w-6xl flex-1 my-3 bg-neutral-900 rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between relative shadow-2xl"
      >
        <div className="flex-1 w-full h-full overflow-auto flex items-center justify-center p-2 sm:p-4 bg-[#e9ecef] dark:bg-[#121417]">
          {docUrl ? (
            <div
              className="w-full h-full transition-transform duration-150 flex items-center justify-center"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
              }}
            >
              <iframe
                src={viewerUrl || docUrl}
                title={`Paparan Proyek - ${project.title}`}
                className="w-full h-full min-h-[460px] sm:min-h-[580px] rounded-xl shadow-lg border-0 bg-white"
                allowFullScreen
              />
            </div>
          ) : (
            /* Mock Slide Preview when document is not uploaded yet */
            <div
              className="w-full max-w-4xl aspect-[16/10] bg-white text-neutral-900 rounded-xl shadow-2xl p-6 sm:p-10 md:p-12 flex flex-col justify-between relative overflow-hidden transition-transform duration-150"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
              }}
            >
              {/* Header Logos & Title */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-2xl">terrain</span>
                    <span className="font-bold text-xs uppercase tracking-wider text-neutral-700">
                      Departemen Teknik Geologi &bull; Portofolio Proyek
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-neutral-500">
                    LAPORAN AKHIR
                  </span>
                </div>

                <div className="pt-4 space-y-2">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-neutral-900 leading-snug">
                    {project.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                    Lokasi: {project.location} &bull; Durasi Pelaksanaan: {project.duration}
                  </p>
                </div>
              </div>

              {/* Body Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-auto pt-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Ringkasan Teknis Proyek:
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="pt-2">
                    <span className="inline-block px-3 py-1 rounded bg-neutral-100 text-[11px] font-mono text-neutral-700 font-semibold border">
                      Deliverable: {project.deliverable}
                    </span>
                  </div>
                </div>

                <div className="relative rounded-lg overflow-hidden border bg-neutral-100 aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Slide Footer */}
              <div className="flex items-center justify-between border-t pt-3 text-[11px] text-neutral-500 font-mono">
                <span>Novrijal Ramadhany, S.T. &bull; Geological Engineering</span>
                <span>Dokumen Paparan Proyek</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="bg-surface-container-lowest border-t border-surface-container-high px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3 shadow-inner">
          {/* Left: Zoom Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-lg border border-outline-variant/60 bg-surface text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center font-bold text-sm shadow-xs"
              title="Zoom Out"
            >
              &minus;
            </button>
            <span className="px-2 font-mono text-xs text-on-surface min-w-[50px] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-lg border border-outline-variant/60 bg-surface text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center font-bold text-sm shadow-xs"
              title="Zoom In"
            >
              &#43;
            </button>
          </div>

          {/* Right: Fullscreen, Open PDF/Doc, Download */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/60 bg-surface text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-xs"
              title="Layar Penuh"
            >
              <span className="material-symbols-outlined text-sm">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
              <span className="hidden sm:inline">Fullscreen</span>
            </button>

            {docUrl && (
              <button
                onClick={handleOpenDoc}
                className="px-3 py-1.5 rounded-lg border border-outline-variant/60 bg-surface text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-xs"
                title="Buka Dokumen di Tab Baru"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                <span className="hidden sm:inline">{isPdf ? 'Open PDF' : 'Open Doc'}</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={!docUrl || downloading}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              title="Unduh Berkas Langsung"
            >
              <span className={`material-symbols-outlined text-sm ${downloading ? 'animate-spin' : ''}`}>
                {downloading ? 'progress_activity' : 'download'}
              </span>
              <span>{downloading ? 'Mengunduh...' : 'Download'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
