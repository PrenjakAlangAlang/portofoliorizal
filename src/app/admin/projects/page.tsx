'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectDetails } from '@/lib/types';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<Project> | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Structured technical details states for "Lihat Proyek" case study modal
  const [objectivesInput, setObjectivesInput] = useState('');
  const [datasetInput, setDatasetInput] = useState('');
  const [workflowInput, setWorkflowInput] = useState('');
  const [methodsInput, setMethodsInput] = useState('');
  const [resultsInput, setResultsInput] = useState('');
  const [keyFindingsInput, setKeyFindingsInput] = useState('');
  const [softwareUsedInput, setSoftwareUsedInput] = useState('');
  const [docDescInput, setDocDescInput] = useState('');
  const [docTagsInput, setDocTagsInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const sampleImages = [
    {
      label: 'Singkapan Batuan Porfiri',
      url: 'https://images.unsplash.com/photo-1518384401463-d3876163c195?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Sayatan Tipis Petrografi',
      url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Survei Geolistrik Air Tanah',
      url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    },
    {
      label: 'Topografi & Morfologi Lereng',
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const loadData = () => {
    setLoading(true);
    fetch('/api/admin/projects')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => {
        setFeedback({ type: 'error', text: 'Gagal memuat portofolio proyek.' });
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditingItem(null);
    };
    if (editingItem) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [editingItem]);

  const handleCreateNew = () => {
    setEditingItem({
      id: `proj-${Date.now()}`,
      title: '',
      location: '',
      duration: '',
      description: '',
      deliverable: '',
      deliverable_color: 'primary',
      image_url: sampleImages[0].url,
      tags: [],
      order_index: projects.length,
    });
    setTagInput('');
    setObjectivesInput('');
    setDatasetInput('');
    setWorkflowInput('');
    setMethodsInput('');
    setResultsInput('');
    setKeyFindingsInput('');
    setSoftwareUsedInput('');
    setDocDescInput('');
    setDocTagsInput('');
  };

  const handleEdit = (item: Project) => {
    setEditingItem({ ...item });
    setTagInput('');

    const d = item.details || {};
    setObjectivesInput(d.objectives?.join('\n') || '');
    setDatasetInput(d.dataset?.join('\n') || '');
    setWorkflowInput(d.workflow?.join('\n') || '');
    setMethodsInput(d.methods?.join('\n') || '');
    setResultsInput(d.results?.join('\n') || '');
    setKeyFindingsInput(d.key_findings?.join('\n') || '');
    setSoftwareUsedInput(d.software_used?.join(', ') || '');
    setDocDescInput(d.doc_description || '');
    setDocTagsInput(d.doc_tags?.join(', ') || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus proyek ini dari portofolio?')) return;
    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ type: 'success', text: 'Proyek berhasil dihapus.' });
        loadData();
      }
    } catch {
      setFeedback({ type: 'error', text: 'Gagal menghapus data proyek.' });
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploadingImage(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setEditingItem((prev) => (prev ? { ...prev, image_url: data.url } : null));
        setFeedback({ type: 'success', text: 'Foto dokumentasi proyek berhasil diunggah!' });
      } else {
        setFeedback({ type: 'error', text: data.error || 'Gagal mengunggah foto.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Terjadi kesalahan jaringan saat mengunggah foto.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDocUpload = async (file: File) => {
    // Validasi ukuran berkas maksimal 100 MB
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFeedback({
        type: 'error',
        text: `Ukuran berkas (${sizeMb} MB) melebihi batas maksimal 100 MB. Silakan pilih berkas yang lebih kecil.`,
      });
      return;
    }

    setUploadingDoc(true);
    setFeedback(null);

    try {
      let fileToUpload = file;
      const lowerName = file.name.toLowerCase();
      const isPpt = lowerName.endsWith('.ppt') || lowerName.endsWith('.pptx');

      // Jika file PPT/PPTX, konversi menjadi PDF sebelum diunggah
      if (isPpt) {
        setFeedback({
          type: 'success',
          text: `Mengonversi presentasi "${file.name}" ke format PDF...`,
        });
        const { convertPptxToPdf } = await import('@/lib/ppt-to-pdf');
        const pdfBlob = await convertPptxToPdf(file);
        const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.pdf';
        fileToUpload = new File([pdfBlob], newFileName, { type: 'application/pdf' });
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setEditingItem((prev) =>
          prev
            ? {
                ...prev,
                document_url: data.url,
                document_name: fileToUpload.name,
              }
            : null
        );
        setFeedback({
          type: 'success',
          text: isPpt
            ? `Berkas PPT "${file.name}" berhasil dikonversi dan disimpan sebagai PDF!`
            : `Berkas "${file.name}" berhasil diunggah!`,
        });
      } else {
        setFeedback({
          type: 'error',
          text: data.error || 'Gagal mengunggah berkas presentasi.',
        });
      }
    } catch (err: unknown) {
      console.warn('Upload error:', err);
      setFeedback({
        type: 'error',
        text: 'Terjadi kesalahan saat memproses atau mengunggah berkas.',
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || !editingItem) return;
    const currentTags = editingItem.tags || [];
    if (!currentTags.includes(tagInput.trim())) {
      setEditingItem({
        ...editingItem,
        tags: [...currentTags, tagInput.trim()],
      });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      tags: (editingItem.tags || []).filter((t) => t !== tagToRemove),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title || !editingItem.image_url) return;
    setSaving(true);
    setFeedback(null);

    const details: ProjectDetails = {
      objectives: objectivesInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      dataset: datasetInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      workflow: workflowInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      methods: methodsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      results: resultsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      key_findings: keyFindingsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      software_used: softwareUsedInput
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
      doc_description: docDescInput.trim(),
      doc_tags: docTagsInput
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const payload: Project = {
      ...(editingItem as Project),
      details,
    };

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: 'Proyek dan detail studi kasus berhasil disimpan.' });
        setEditingItem(null);
        loadData();
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', text: err.error || 'Gagal menyimpan proyek.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Kelola Pengalaman Proyek</h1>
          <p className="text-xs text-on-surface-variant pt-1">
            Daftar karya lapangan, survei regional, pemodelan 3D, dokumen presentasi, dan studi kasus teknis.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Tambah Proyek</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-tertiary-fixed/30 text-tertiary border border-tertiary-fixed'
              : 'bg-error-container/40 text-error border border-error-container'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {feedback.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Editor Modal Overlay */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs overflow-y-auto p-4 sm:p-6 md:p-8 flex justify-center items-start animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingItem(null);
          }}
        >
          <div
            className="w-full max-w-4xl my-4 sm:my-8 p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-2xl space-y-6 text-on-surface animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_document</span>
                <span>
                  {projects.some((p) => p.id === editingItem.id)
                    ? 'Edit Pengalaman Proyek'
                    : 'Tambah Pengalaman Proyek Baru'}
                </span>
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-md"
                title="Tutup (Esc)"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Bagian 1: Informasi Utama */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">info</span>
                <span>1. Informasi Utama Proyek</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-semibold text-on-surface">
                    Judul Proyek / Studi Kasus <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Carbonate Reservoir Characterization of the Baturaja Formation..."
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    Lokasi / Cekungan Geologi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Cekungan Sumatera Selatan / Sulawesi Utara"
                    value={editingItem.location || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    Durasi / Rentang Waktu (Banner Header)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: APRIL 2026 – JULY 2026 atau 8 Bulan"
                    value={editingItem.duration || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Ringkasan / Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  placeholder="Ringkasan eksekutif atau latar belakang teknis proyek..."
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    Target Deliverable / Output Utama
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Model Inversi 3D & Rekomendasi Pemboran"
                    value={editingItem.deliverable || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, deliverable: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    Warna Indikator Deliverable
                  </label>
                  <select
                    value={editingItem.deliverable_color || 'primary'}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        deliverable_color: e.target.value as
                          | 'primary'
                          | 'secondary'
                          | 'tertiary'
                          | 'error',
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary"
                  >
                    <option value="primary">Ochre / Terra-Cotta (Primary)</option>
                    <option value="secondary">Slate Navy (Secondary)</option>
                    <option value="tertiary">Lichen Green (Tertiary)</option>
                    <option value="error">Hematite Red (Error/Warning)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bagian 2: Upload Foto Lapangan & Tags */}
            <div className="space-y-4 pt-4 border-t border-surface-container-high">
              <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">image</span>
                <span>2. Dokumentasi Foto Lapangan & Tag Proyek</span>
              </h3>

              <div className="p-4 rounded-xl bg-surface border border-outline-variant/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-on-surface">
                    Dokumentasi Foto Lapangan / Spesimen <span className="text-error">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-tertiary font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                    Upload File Langsung
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-48 aspect-video rounded-xl overflow-hidden border border-outline-variant/40 bg-surface-container flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editingItem.image_url || sampleImages[0].url}
                      alt="Pratinjau"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />

                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">upload_file</span>
                      <span>
                        {uploadingImage ? 'Mengunggah Foto...' : 'Pilih File Foto Lapangan'}
                      </span>
                    </button>

                    <p className="text-[10px] text-on-surface-variant font-mono">
                      Mendukung file JPG, PNG, WEBP langsung dari perangkat Anda.
                    </p>

                    <div className="pt-1 space-y-1">
                      <span className="text-[10px] font-mono text-on-surface-variant block">
                        Atau pilih contoh foto spesimen cepat:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {sampleImages.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setEditingItem({ ...editingItem, image_url: s.url })}
                            className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[10px] text-on-surface border border-outline-variant/40 cursor-pointer"
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tag / Topik */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface">
                  Tag / Topik Terkait (Muncul sebagai pill di bawah judul)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Carbonate Reservoir, Seismic Inversion, Rock Physics..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant/60 bg-surface text-xs font-mono focus:outline-hidden focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface cursor-pointer"
                  >
                    Tambah Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(editingItem.tags || []).map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container text-xs font-mono text-on-surface border border-outline-variant/40"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-on-surface-variant hover:text-error cursor-pointer"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bagian 3: Detail Studi Kasus & Pengalaman Proyek (Untuk Modal "Lihat Proyek") */}
            <div className="space-y-4 pt-4 border-t border-surface-container-high">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-widest text-primary uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">science</span>
                  <span>3. Pengalaman Proyek & Studi Kasus </span>
                </h3>
                <p className="text-[11px] text-on-surface-variant pt-0.5">
                  Keterangan teknis terstruktur yang muncul di tampilan &quot;Lihat Proyek&quot;
                  seperti Objectives, Dataset, Workflow, Methods, Results, dan Key Findings.
                </p>
              </div>

              {/* 2-Column Grid untuk Objectives & Dataset */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    OBJECTIVES (Tujuan Proyek)
                    <span className="text-[10px] text-on-surface-variant font-mono font-normal ml-1">
                      (1 poin per baris)
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Contoh:&#10;Characterize carbonate reservoir quality from elastic volumes.&#10;Define quantitative cut-offs that separate reservoir from non-reservoir facies.&#10;Translate the integrated interpretation into a drilling recommendation."
                    value={objectivesInput}
                    onChange={(e) => setObjectivesInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs focus:outline-hidden focus:border-primary font-sans leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    DATASET (Data yang Digunakan)
                    <span className="text-[10px] text-on-surface-variant font-mono font-normal ml-1">
                      (1 poin per baris)
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Contoh:&#10;3 wells with complete petrophysical suites&#10;3D partial-stack seismic volumes&#10;Checkshot and well marker data"
                    value={datasetInput}
                    onChange={(e) => setDatasetInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs focus:outline-hidden focus:border-primary font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* 2-Column Grid untuk Workflow & Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    WORKFLOW (Alur Kerja)
                    <span className="text-[10px] text-on-surface-variant font-mono font-normal ml-1">
                      (1 tahapan per baris, otomatis diberi nomor 01, 02, ...)
                    </span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Contoh:&#10;Well log conditioning and petrophysical analysis&#10;Rock physics analysis and sensitivity testing&#10;Well-to-seismic tie and wavelet extraction&#10;Seismic stratigraphic framework interpretation&#10;Simultaneous and extended elastic impedance inversion&#10;Reservoir property prediction and QC"
                    value={workflowInput}
                    onChange={(e) => setWorkflowInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs focus:outline-hidden focus:border-primary font-sans leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    METHODS (Metode Analisis)
                    <span className="text-[10px] text-on-surface-variant font-mono font-normal ml-1">
                      (1 metode per baris)
                    </span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Contoh:&#10;Seismic stratigraphy&#10;Rock physics modeling&#10;SPEIL / SCPEI extended elastic impedance&#10;Acoustic impedance and Vp/Vs inversion"
                    value={methodsInput}
                    onChange={(e) => setMethodsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs focus:outline-hidden focus:border-primary font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* 2-Column Grid untuk Results & Key Findings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    RESULTS (Hasil Analisis)
                    <span className="text-[10px] text-on-surface-variant font-mono font-normal ml-1">
                      (1 poin per baris)
                    </span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Contoh:&#10;Integrated well, petrophysical, and 3D partial-stack seismic data from 3 wells.&#10;Generated and evaluated 6 elastic and reservoir-property volumes: AI, Vp/Vs, SPEIL, SCPEI, pseudo-density, and pseudo-porosity.&#10;Achieved inversion QC correlations reaching 0.93.&#10;Established quantitative reservoir indicators of P-Impedance < 6,400 (m/s·g/cc) and Vp/Vs < 2."
                    value={resultsInput}
                    onChange={(e) => setResultsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs focus:outline-hidden focus:border-primary font-sans leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    KEY FINDINGS (Temuan Kunci)
                    <span className="text-[10px] text-on-surface-variant font-mono font-normal ml-1">
                      (1 poin per baris)
                    </span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Contoh:&#10;A reefal buildup was identified as the highest-quality reservoir sweet spot.&#10;Drilling recommendation targets an anticline crest with structural closure and favorable reservoir quality."
                    value={keyFindingsInput}
                    onChange={(e) => setKeyFindingsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs focus:outline-hidden focus:border-primary font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* Software Used */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  SOFTWARE USED (Perangkat Lunak yang Digunakan)
                  <span className="text-[10px] text-on-surface-variant font-mono font-normal ml-1">
                    (Pisahkan dengan koma)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Petrel, Hampson-Russell, Interactive Petrophysics, Python"
                  value={softwareUsedInput}
                  onChange={(e) => setSoftwareUsedInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary"
                />
              </div>

              {/* Project Document Description & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    PROJECT DOCUMENT (Keterangan Dokumen Proyek)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Complete undergraduate thesis documenting the integrated seismic, well-log, petrophysical, inversion, and seismic-stratigraphic workflow used for carbonate reservoir characterization."
                    value={docDescInput}
                    onChange={(e) => setDocDescInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs focus:outline-hidden focus:border-primary font-sans leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    DOCUMENT TAGS (Tag/Badges Berkas)
                    <span className="text-[10px] text-on-surface-variant font-mono font-normal ml-1">
                      (Pisahkan dengan koma)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: 3 Wells, 6 Reservoir / Elastic Volumes, Seismic Inversion, SPEIL, SCPEI, Seismic Stratigraphy, Reservoir Characterization"
                    value={docTagsInput}
                    onChange={(e) => setDocTagsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs focus:outline-hidden focus:border-primary font-mono leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 4: Dokumen Berkas Paparan (PPT / PDF) */}
            <div className="space-y-3 p-4 rounded-xl bg-surface border border-outline-variant/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">slideshow</span>
                  <span>4. Berkas Paparan Proyek / Slide Viewer (PPT / PDF)</span>
                </label>
                <span className="text-[10px] font-mono text-on-surface-variant">
                  Format didukung: .pdf, .ppt, .pptx (Maks. 100 MB)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center pt-1">
                <input
                  type="file"
                  ref={docInputRef}
                  accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDocUpload(file);
                  }}
                />

                <button
                  type="button"
                  disabled={uploadingDoc}
                  onClick={() => docInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface flex items-center gap-2 border border-outline-variant/60 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span>{uploadingDoc ? 'Mengunggah Berkas...' : 'Unggah File PPT / PDF'}</span>
                </button>

                {editingItem.document_url ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-xs text-primary font-mono truncate max-w-full">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span className="truncate">
                      {editingItem.document_name || 'Berkas Terunggah'}
                    </span>
                    <a
                      href={editingItem.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline ml-1"
                      title="Lihat Berkas"
                    >
                      [Buka]
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem({
                          ...editingItem,
                          document_url: undefined,
                          document_name: undefined,
                        })
                      }
                      className="text-on-surface-variant hover:text-error ml-1 font-bold text-base cursor-pointer"
                      title="Hapus berkas dari proyek"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-on-surface-variant italic">
                    Belum ada berkas dilampirkan.
                  </span>
                )}
              </div>
            </div>

            {/* Tombol Simpan & Batal */}
            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || uploadingImage || uploadingDoc}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {saving ? 'Menyimpan...' : 'Simpan Proyek & Studi Kasus'}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Grid of Projects */}
      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-on-surface-variant">
          Memuat daftar proyek...
        </div>
      ) : projects.length === 0 ? (
        <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container-lowest rounded-xl border border-surface-container-high">
          Belum ada proyek. Klik &quot;Tambah Proyek&quot; untuk memulai.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl bg-surface-container-lowest border border-surface-container-high overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-all shadow-xs"
            >
              <div className="relative aspect-video w-full bg-surface-container overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proj.image_url}
                  alt={proj.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[10px]">
                  {proj.duration}
                </span>
                {proj.document_url && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary text-white font-mono text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-xs">slideshow</span>
                    PPT/PDF
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono text-primary font-semibold block">
                    {proj.location}
                  </span>
                  <h3 className="font-bold text-sm text-on-surface line-clamp-1">{proj.title}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 pt-1">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-surface-container-high flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-on-surface-variant truncate">
                    {proj.deliverable}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(proj)}
                      className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface cursor-pointer"
                      title="Edit Proyek & Studi Kasus"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-1.5 rounded-lg bg-error-container/30 hover:bg-error-container text-error cursor-pointer"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
