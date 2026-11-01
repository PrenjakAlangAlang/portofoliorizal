'use client';

import React, { useState, useEffect } from 'react';
import { Certification } from '@/lib/types';

export default function AdminCertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<Certification> | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadData = () => {
    setLoading(true);
    fetch('/api/admin/certifications')
      .then((res) => res.json())
      .then((data) => {
        setCertifications(data);
        setLoading(false);
      })
      .catch(() => {
        setFeedback({ type: 'error', text: 'Gagal memuat sertifikasi.' });
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNew = () => {
    setEditingItem({
      id: `cert-${Date.now()}`,
      title: '',
      issuer: '',
      year: new Date().getFullYear().toString(),
      description: '',
      credential_url: '#',
      order_index: certifications.length,
    });
  };

  const handleEdit = (item: Certification) => {
    setEditingItem({ ...item });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus sertifikasi ini?')) return;
    try {
      const res = await fetch(`/api/admin/certifications?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ type: 'success', text: 'Sertifikasi berhasil dihapus.' });
        loadData();
      }
    } catch {
      setFeedback({ type: 'error', text: 'Gagal menghapus sertifikasi.' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.title || !editingItem.issuer) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: 'Sertifikasi berhasil disimpan.' });
        setEditingItem(null);
        loadData();
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', text: err.error || 'Gagal menyimpan sertifikasi.' });
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
          <h1 className="text-2xl font-bold text-on-surface">Kelola Sertifikasi &amp; Pelatihan</h1>
          <p className="text-xs text-on-surface-variant pt-1">
            Lisensi keselamatan minerba, penguasaan software 3D, sertifikasi bahari, dan training profesional.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Tambah Sertifikasi</span>
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
              {editingItem.id && certifications.some((c) => c.id === editingItem.id)
                ? 'Edit Sertifikasi / Pelatihan'
                : 'Tambah Sertifikasi Baru'}
            </h2>
            <button
              onClick={() => setEditingItem(null)}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Nama Sertifikasi / Pelatihan <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="POP (Pengawas Operasional Pertama)"
                value={editingItem.title || ''}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, title: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Lembaga Penerbit / Penguji <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ESDM • BNSP"
                  value={editingItem.issuer || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, issuer: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Tahun Perolehan
                </label>
                <input
                  type="text"
                  placeholder="2023"
                  value={editingItem.year || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, year: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Keterangan Singkat Kompetensi
              </label>
              <textarea
                rows={3}
                placeholder="Pengawasan keselamatan operasional minerba sesuai Kepmen ESDM..."
                value={editingItem.description || ''}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, description: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Tautan Kredensial / Sertifikat Digital (Opsional)
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={editingItem.credential_url || ''}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, credential_url: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary"
              />
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
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Sertifikasi'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Certifications */}
      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-on-surface-variant">
          Memuat sertifikasi...
        </div>
      ) : certifications.length === 0 ? (
        <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container-lowest rounded-xl border border-surface-container-high">
          Belum ada sertifikasi. Klik "Tambah Sertifikasi" untuk menambahkan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high hover:border-tertiary/50 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-secondary">{cert.issuer}</span>
                  <span className="text-primary font-bold">{cert.year}</span>
                </div>
                <h3 className="font-bold text-sm text-on-surface">{cert.title}</h3>
                <p className="text-xs text-on-surface-variant">{cert.description}</p>
              </div>

              <div className="pt-3 border-t border-surface-container-high flex items-center justify-between">
                <span className="text-[10px] font-mono text-tertiary font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  Valid
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEdit(cert)}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="p-1.5 rounded-lg bg-error-container/30 hover:bg-error-container text-error"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
