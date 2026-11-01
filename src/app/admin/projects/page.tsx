'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project } from '@/lib/types';

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const sampleImages = [
    { label: 'Singkapan Batuan Porfiri', url: 'https://images.unsplash.com/photo-1518384401463-d3876163c195?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Sayatan Tipis Petrografi', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Survei Geolistrik Air Tanah', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Topografi & Morfologi Lereng', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
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
  };

  const handleEdit = (item: Project) => {
    setEditingItem({ ...item });
    setTagInput('');
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
    const formData = new FormData();
    formData.append('file', file);
    setUploadingDoc(true);
    setFeedback(null);

    try {
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
                document_name: file.name,
              }
            : null
        );
        setFeedback({
          type: 'success',
          text: `Berkas paparan "${file.name}" berhasil diunggah!`,
        });
      } else {
        setFeedback({
          type: 'error',
          text: data.error || 'Gagal mengunggah berkas presentasi.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        text: 'Terjadi kesalahan jaringan saat mengunggah berkas.',
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

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: 'Proyek berhasil disimpan.' });
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
            Daftar karya lapangan, survei regional, pemodelan 3D geologi, dan output laporan.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 self-start sm:self-auto"
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
          <span className="material-symbols-outlined text-lg">
            {feedback.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Editor Modal / Form */}
      {editingItem && (
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-primary/40 shadow-lg space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
            <h2 className="text-sm font-bold text-on-surface">
              {editingItem.id && projects.some((p) => p.id === editingItem.id)
                ? 'Edit Portofolio Proyek'
                : 'Tambah Proyek Baru'}
            </h2>
            <button
              onClick={() => setEditingItem(null)}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold text-on-surface">
                  Judul Proyek Geologi <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Pemetaan Geologi Regional & Alterasi Porfiri Cu-Au"
                  value={editingItem.title || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Lokasi / Cekungan Geologi
                </label>
                <input
                  type="text"
                  placeholder="Halmahera Utara"
                  value={editingItem.location || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, location: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Durasi Proyek
                </label>
                <input
                  type="text"
                  placeholder="8 Bulan"
                  value={editingItem.duration || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, duration: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Deskripsi Metodologi &amp; Investigasi
              </label>
              <textarea
                rows={3}
                placeholder="Survei 120 singkapan batuan, zoning alterasi hidrotermal, dan 85 rock chip sampling..."
                value={editingItem.description || ''}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, description: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Deliverable (Output Akhir)
                </label>
                <input
                  type="text"
                  placeholder="Peta Geologi 1:25.000 & Model Target Bor"
                  value={editingItem.deliverable || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, deliverable: e.target.value })
                  }
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
                      deliverable_color: e.target.value as 'primary' | 'secondary' | 'tertiary' | 'error',
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

            {/* Upload Gambar Foto Proyek Langsung Berupa File */}
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
                {/* Live Preview */}
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">upload_file</span>
                    <span>{uploadingImage ? 'Mengunggah Foto...' : 'Pilih File Foto Lapangan'}</span>
                  </button>

                  <p className="text-[10px] text-on-surface-variant font-mono">
                    Mendukung file JPG, PNG, WEBP langsung dari perangkat Anda.
                  </p>

                  {/* Sample Quick Selector */}
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
                          className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[10px] text-on-surface border border-outline-variant/40"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags Management */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface">
                Tag / Topik Terkait
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tambah tag topik..."
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
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface"
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
                      className="text-on-surface-variant hover:text-error"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Presentation Document Upload (PPT / PDF) */}
            <div className="space-y-2 p-4 rounded-xl bg-surface border border-outline-variant/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">slideshow</span>
                  <span>Paparan Proyek / Berkas Presentasi (PPT / PDF)</span>
                </label>
                <span className="text-[10px] font-mono text-on-surface-variant">
                  Format: .pdf, .ppt, .pptx
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
                  className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface flex items-center gap-2 border border-outline-variant/60 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span>{uploadingDoc ? 'Mengunggah Berkas...' : 'Unggah File PPT / PDF'}</span>
                </button>

                {editingItem.document_url ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-xs text-primary font-mono truncate max-w-full">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span className="truncate">{editingItem.document_name || 'Berkas Terunggah'}</span>
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
                      className="text-on-surface-variant hover:text-error ml-1 font-bold text-base"
                      title="Hapus berkas dari proyek"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-on-surface-variant italic">
                    Belum ada berkas paparan dilampirkan.
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Proyek'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Projects */}
      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-on-surface-variant">
          Memuat daftar proyek...
        </div>
      ) : projects.length === 0 ? (
        <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container-lowest rounded-xl border border-surface-container-high">
          Belum ada proyek. Klik "Tambah Proyek" untuk memulai.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl bg-surface-container-lowest border border-surface-container-high overflow-hidden flex flex-col justify-between hover:border-primary/40 transition-all"
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
                  <h3 className="font-bold text-sm text-on-surface line-clamp-1">
                    {proj.title}
                  </h3>
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
                      className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-1.5 rounded-lg bg-error-container/30 hover:bg-error-container text-error"
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
