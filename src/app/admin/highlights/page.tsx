'use client';

import React, { useState, useEffect } from 'react';
import { Highlight } from '@/lib/types';

export default function AdminHighlightsPage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<Highlight> | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadData = () => {
    setLoading(true);
    fetch('/api/admin/highlights')
      .then((res) => res.json())
      .then((data) => {
        setHighlights(data);
        setLoading(false);
      })
      .catch(() => {
        setFeedback({ type: 'error', text: 'Gagal memuat data sorotan.' });
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNew = () => {
    setEditingItem({
      id: `hl-${Date.now()}`,
      value: '',
      label: '',
      description: '',
      order_index: highlights.length,
    });
  };

  const handleEdit = (item: Highlight) => {
    setEditingItem({ ...item });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pencapaian/sorotan ini?')) return;
    try {
      const res = await fetch(`/api/admin/highlights?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ type: 'success', text: 'Pencapaian berhasil dihapus.' });
        loadData();
      }
    } catch {
      setFeedback({ type: 'error', text: 'Gagal menghapus pencapaian.' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.value || !editingItem.label) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: 'Pencapaian berhasil disimpan.' });
        setEditingItem(null);
        loadData();
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', text: err.error || 'Gagal menyimpan pencapaian.' });
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
          <h1 className="text-xl sm:text-2xl font-black text-on-surface">
            Pencapaian &amp; Sorotan
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Kelola metrik utama, data statistik eksplorasi, dan pencapaian akademik Anda.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 rounded-xl bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Sorotan Baru
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-error-container/40 text-error border-error/20'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {feedback.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Modal / Editor Form */}
      {editingItem && (
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-md space-y-5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">insights</span>
              {editingItem.id && highlights.some((h) => h.id === editingItem.id)
                ? 'Edit Pencapaian / Sorotan'
                : 'Tambah Pencapaian / Sorotan Baru'}
            </h2>
            <button
              onClick={() => setEditingItem(null)}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Angka / Nilai Metrik <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 3.50 / 4.00, 10+ Wells, 25+ Maps, 390.9 Bscf"
                  value={editingItem.value || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono font-bold focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-[11px] text-on-surface-variant">
                  Format angka ringkas dan menonjol (muncul dengan huruf besar &amp; tebal).
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Label / Judul Sorotan <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: IPK Kelulusan S1, Core Logging &amp; Supervisi"
                  value={editingItem.label || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Keterangan / Rincian Penjelasan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: UPN 'Veteran' Yogyakarta, Dihasilkan melalui MineScape &amp; ArcGIS"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Urutan Tampilan
                </label>
                <input
                  type="number"
                  value={editingItem.order_index ?? 0}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, order_index: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Live Card Preview */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                Pratinjau Tampilan Kartu
              </label>
              <div className="max-w-xs p-5 rounded-2xl bg-surface border border-surface-container-high space-y-2 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-on-surface font-mono">
                  {editingItem.value || '0.00'}
                </div>
                <div className="text-xs sm:text-sm font-bold text-on-surface">
                  {editingItem.label || 'Judul Sorotan'}
                </div>
                {editingItem.description && (
                  <div className="pt-2 border-t border-surface-container-high/60 text-[11px] text-on-surface-variant">
                    {editingItem.description}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg border border-surface-container-highest text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                {saving ? 'Menyimpan...' : 'Simpan Sorotan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Highlights Grid Display */}
      {loading ? (
        <div className="py-12 text-center text-xs text-on-surface-variant flex items-center justify-center gap-2">
          <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
          Memuat data pencapaian...
        </div>
      ) : highlights.length === 0 ? (
        <div className="p-8 text-center bg-surface-container-lowest border border-surface-container-high rounded-2xl space-y-3">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant">
            insights
          </span>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Belum ada sorotan atau pencapaian yang ditambahkan.
          </p>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Tambah Sorotan Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((hl) => (
            <div
              key={hl.id}
              className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between group relative space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-primary uppercase bg-primary-fixed/20 px-2 py-0.5 rounded-md">
                    #{hl.order_index}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(hl)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(hl.id)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>

                <div className="text-2xl font-black text-on-surface font-mono tracking-tight pt-1">
                  {hl.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-on-surface leading-snug">
                  {hl.label}
                </div>
                {hl.description && (
                  <p className="text-[11px] text-on-surface-variant leading-relaxed pt-1 border-t border-surface-container-high/60">
                    {hl.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
