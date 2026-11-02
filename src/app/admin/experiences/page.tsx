'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Experience } from '@/lib/types';

export default function AdminExperiencesPage() {
  const currentYear = new Date().getFullYear();
  // Rentang tahun dari 10 tahun ke depan hingga tahun 1980
  const yearOptions = Array.from(
    { length: currentYear + 10 - 1980 + 1 },
    (_, i) => (currentYear + 10 - i).toString()
  );

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<Experience> | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [startYear, setStartYear] = useState<string>('');
  const [endYear, setEndYear] = useState<string>('Sekarang');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const docInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    setLoading(true);
    fetch('/api/admin/experiences')
      .then((res) => res.json())
      .then((data) => {
        setExperiences(data);
        setLoading(false);
      })
      .catch(() => {
        setFeedback({ type: 'error', text: 'Gagal memuat daftar pengalaman kerja.' });
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

  const handlePeriodChange = (start: string, end: string) => {
    setStartYear(start);
    setEndYear(end);
    let formatted = '';
    if (start && end) {
      formatted = `${start} — ${end}`;
    } else if (start) {
      formatted = start;
    } else if (end) {
      formatted = end;
    }
    setEditingItem((prev) => (prev ? { ...prev, period: formatted } : null));
  };

  const handleCreateNew = () => {
    const defaultStart = (currentYear - 2).toString();
    const defaultEnd = 'Sekarang';
    setStartYear(defaultStart);
    setEndYear(defaultEnd);
    setEditingItem({
      id: `exp-${Date.now()}`,
      title: '',
      company: '',
      location: '',
      period: `${defaultStart} — ${defaultEnd}`,
      description: '',
      responsibilities: [],
      tags: [],
      skills: [],
      document_url: '',
      document_name: '',
      order_index: experiences.length,
    });
    setTagInput('');
    setSkillInput('');
  };

  const handleEdit = (item: Experience) => {
    const rawPeriod = item.period || '';
    const parts = rawPeriod.split(/[—–-]/).map((s) => s.trim());
    if (parts.length >= 2) {
      setStartYear(parts[0]);
      setEndYear(parts[1]);
    } else if (parts.length === 1 && parts[0]) {
      setStartYear(parts[0]);
      setEndYear(parts[0]);
    } else {
      setStartYear('');
      setEndYear('Sekarang');
    }

    let formattedDesc = item.description || '';
    if (item.responsibilities && item.responsibilities.length > 0) {
      formattedDesc = item.responsibilities.join('\n');
    } else if (formattedDesc.includes('•')) {
      formattedDesc = formattedDesc
        .split('•')
        .map((s) => s.trim())
        .filter(Boolean)
        .join('\n');
    }

    setEditingItem({
      ...item,
      description: formattedDesc,
      skills: item.skills || [],
      responsibilities: item.responsibilities || [],
      tags: item.tags || [],
    });
    setTagInput('');
    setSkillInput('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengalaman kerja ini?')) return;
    try {
      const res = await fetch(`/api/admin/experiences?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ type: 'success', text: 'Pengalaman kerja berhasil dihapus.' });
        loadData();
      }
    } catch {
      setFeedback({ type: 'error', text: 'Gagal menghapus data.' });
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

  const handleAddSkill = () => {
    if (!skillInput.trim() || !editingItem) return;
    const currentSkills = editingItem.skills || [];
    if (!currentSkills.includes(skillInput.trim())) {
      setEditingItem({
        ...editingItem,
        skills: [...currentSkills, skillInput.trim()],
      });
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      skills: (editingItem.skills || []).filter((s) => s !== skillToRemove),
    });
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
          text: data.error || 'Gagal mengunggah berkas dokumentasi.',
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title || !editingItem.company) return;
    setSaving(true);
    setFeedback(null);

    const rawDesc = editingItem.description || '';
    const lines = rawDesc
      .split(/\r?\n+/)
      .map((l) => l.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);

    const payload = {
      ...editingItem,
      description: rawDesc,
      responsibilities: lines,
    };

    try {
      const res = await fetch('/api/admin/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: 'Pengalaman kerja berhasil disimpan.' });
        setEditingItem(null);
        loadData();
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', text: err.error || 'Gagal menyimpan data.' });
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
          <h1 className="text-2xl font-bold text-on-surface">Kelola Pengalaman Kerja</h1>
          <p className="text-xs text-on-surface-variant pt-1">
            Riwayat karir geologis, peran eksplorasi, nama perusahaan, keahlian, dan berkas dokumentasi proyek.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Tambah Pengalaman</span>
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

      {/* Modal / Editor Overlay */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs overflow-y-auto p-4 sm:p-6 md:p-8 flex justify-center items-start animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingItem(null);
          }}
        >
          <div
            className="w-full max-w-3xl my-4 sm:my-8 p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-2xl space-y-4 text-on-surface animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
              <h2 className="text-sm font-bold text-on-surface">
                {editingItem.id && experiences.some((e) => e.id === editingItem.id)
                  ? 'Edit Pengalaman Kerja'
                  : 'Tambah Pengalaman Kerja Baru'}
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-md"
                title="Tutup (Esc)"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Row 1: Judul Jabatan & Perusahaan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    Jabatan / Peran (Title) <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Senior Field Exploration Geologist"
                    value={editingItem.title || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    Perusahaan / Organisasi <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="PT Nusa Mineral Nusantara"
                    value={editingItem.company || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, company: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              {/* Row 2: Lokasi & Periode Kerja */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    Lokasi / Site Operasional
                  </label>
                  <input
                    type="text"
                    placeholder="Sumbawa & Halmahera"
                    value={editingItem.location || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, location: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-on-surface">
                      Periode Kerja (Tahun) <span className="text-error">*</span>
                    </label>
                    {editingItem.period && (
                      <span className="text-[11px] font-mono text-primary font-bold">
                        {editingItem.period}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-on-surface-variant font-medium mb-1">
                        Dari (Mulai)
                      </label>
                      <select
                        value={startYear}
                        onChange={(e) => handlePeriodChange(e.target.value, endYear)}
                        className="w-full px-2.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs font-mono focus:outline-hidden focus:border-primary"
                      >
                        <option value="">Pilih Tahun</option>
                        {yearOptions.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-on-surface-variant font-medium mb-1">
                        Sampai (Selesai)
                      </label>
                      <select
                        value={endYear}
                        onChange={(e) => handlePeriodChange(startYear, e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs font-mono focus:outline-hidden focus:border-primary"
                      >
                        <option value="Sekarang">Sekarang (Aktif)</option>
                        {yearOptions.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uraian Tanggung Jawab & Lingkup Kerja */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-on-surface">
                    Uraian Tanggung Jawab &amp; Prestasi Kerja
                  </label>
                  <span className="text-[10px] font-mono text-on-surface-variant">
                    Bisa dimasukkan 1 poin per baris
                  </span>
                </div>
                <textarea
                  rows={5}
                  placeholder={`Contoh (tekan Enter untuk baris baru):\nMelakukan pemetaan geologi pada area tambang meliputi data litologi...\nMelakukan interpretasi geometri lapisan batubara...\nMenganalisis kualitas batubara berdasarkan data laboratorium...`}
                  value={editingItem.description || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary font-sans leading-relaxed"
                />
              </div>

              {/* Tag / Kategori Pengalaman */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface">
                  Tag / Kategori Pengalaman
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tambah tag (contoh: Core Logging, Alterasi)..."
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

              {/* Skill / Keahlian yang Digunakan */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-on-surface">
                  Skill / Keahlian &amp; Software yang Digunakan
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tambah skill (contoh: Leapfrog Geo, ArcGIS Pro, Core Logging)..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant/60 bg-surface text-xs font-mono focus:outline-hidden focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface cursor-pointer"
                  >
                    Tambah Skill
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(editingItem.skills || []).map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-fixed/30 text-primary border border-primary-fixed text-xs font-mono font-medium"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="text-primary hover:text-error ml-0.5 cursor-pointer"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Berkas Dokumentasi Kerja / Slide Viewer (PPT / PDF, Maks. 100 MB) */}
              <div className="space-y-3 p-4 rounded-xl bg-surface border border-outline-variant/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-base">slideshow</span>
                    <span>Berkas Dokumentasi Kerja / Slide Viewer (PPT / PDF)</span>
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
                            document_url: '',
                            document_name: '',
                          })
                        }
                        className="text-on-surface-variant hover:text-error ml-1 font-bold text-base cursor-pointer"
                        title="Hapus berkas"
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
                  disabled={saving || uploadingDoc}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Pengalaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List Table / Cards */}
      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-on-surface-variant">
          Memuat riwayat kerja...
        </div>
      ) : experiences.length === 0 ? (
        <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container-lowest rounded-xl border border-surface-container-high">
          Belum ada data pengalaman kerja. Klik &quot;Tambah Pengalaman&quot; untuk membuat baru.
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high hover:border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-on-surface">{exp.title}</h3>
                  <span className="font-mono text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded">
                    {exp.period}
                  </span>
                  {exp.document_url && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      <span className="material-symbols-outlined text-xs">description</span>
                      <span>Dokumen PPT/PDF</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-primary font-medium">
                  {exp.company} &bull; {exp.location}
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-2">
                  {exp.description}
                </p>

                {/* Tags */}
                {exp.tags && exp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {exp.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-container-high text-on-surface"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {exp.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary-fixed/20 text-primary border border-primary-fixed/40"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleEdit(exp)}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant/60 hover:bg-surface-container-high text-xs font-semibold text-on-surface flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="px-3 py-1.5 rounded-lg border border-error/30 hover:bg-error-container/20 text-xs font-semibold text-error flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
