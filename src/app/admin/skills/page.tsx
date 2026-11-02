'use client';

import React, { useState, useEffect } from 'react';
import { SkillCategory } from '@/lib/types';

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<SkillCategory> | null>(null);
  const [itemInput, setItemInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const availableIcons = [
    { name: 'terrain', label: 'Geologi Lapangan (Terrain)' },
    { name: 'computer', label: 'Software & Pemodelan (Computer)' },
    { name: 'biotech', label: 'Laboratorium & Petrografi (Biotech)' },
    { name: 'verified_user', label: 'Kepatuhan & K3 (Shield)' },
    { name: 'explore', label: 'Eksplorasi (Compass)' },
    { name: 'layers', label: 'Stratigrafi (Layers)' },
    { name: 'analytics', label: 'Analisis Data (Analytics)' },
  ];

  const loadData = () => {
    setLoading(true);
    fetch('/api/admin/skills')
      .then((res) => res.json())
      .then((data) => {
        setSkills(data);
        setLoading(false);
      })
      .catch(() => {
        setFeedback({ type: 'error', text: 'Gagal memuat keahlian.' });
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
      id: `skill-${Date.now()}`,
      category: '',
      icon_name: 'terrain',
      items: [],
      order_index: skills.length,
    });
    setItemInput('');
  };

  const handleEdit = (item: SkillCategory) => {
    setEditingItem({ ...item });
    setItemInput('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kategori keahlian ini?')) return;
    try {
      const res = await fetch(`/api/admin/skills?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ type: 'success', text: 'Kategori berhasil dihapus.' });
        loadData();
      }
    } catch {
      setFeedback({ type: 'error', text: 'Gagal menghapus kategori.' });
    }
  };

  const handleAddItem = () => {
    if (!itemInput.trim() || !editingItem) return;
    const current = editingItem.items || [];
    if (!current.includes(itemInput.trim())) {
      setEditingItem({
        ...editingItem,
        items: [...current, itemInput.trim()],
      });
    }
    setItemInput('');
  };

  const handleRemoveItem = (itemToRemove: string) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      items: (editingItem.items || []).filter((i) => i !== itemToRemove),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.category) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: 'Keahlian berhasil disimpan.' });
        setEditingItem(null);
        loadData();
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', text: err.error || 'Gagal menyimpan keahlian.' });
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
          <h1 className="text-2xl font-bold text-on-surface">Kelola Keahlian</h1>
          <p className="text-xs text-on-surface-variant pt-1">
            Pengelompokan kompetensi geologi: lapangan, software spasial, laboratorium, dan standar K3.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Tambah Kategori Keahlian</span>
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

      {/* Editor Modal Overlay */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs overflow-y-auto p-4 sm:p-6 md:p-8 flex justify-center items-start animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingItem(null);
          }}
        >
          <div
            className="w-full max-w-xl my-4 sm:my-8 p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-2xl space-y-4 text-on-surface animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
              <h2 className="text-sm font-bold text-on-surface">
                {editingItem.id && skills.some((s) => s.id === editingItem.id)
                  ? 'Edit Kategori Keahlian'
                  : 'Tambah Kategori Baru'}
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
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Nama Kategori <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Geologi Lapangan"
                value={editingItem.category || ''}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, category: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary font-medium"
              />
            </div>

            {/* Sub-items (Pills) Management */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-on-surface">
                Daftar Alat / Keterampilan Teknis
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tambah skill (contoh: Brunton Compass)..."
                  value={itemInput}
                  onChange={(e) => setItemInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant/60 bg-surface text-xs font-mono focus:outline-hidden focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-xs font-semibold text-on-surface"
                >
                  Tambah
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {(editingItem.items || []).map((it, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-surface-container text-xs font-medium text-on-surface border border-outline-variant/40"
                  >
                    <span>{it}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(it)}
                      className="text-on-surface-variant hover:text-error"
                    >
                      &times;
                    </button>
                  </span>
                ))}
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
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Menyimpan...' : 'Simpan Kategori'}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Grid of Skill Categories */}
      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-on-surface-variant">
          Memuat keahlian...
        </div>
      ) : skills.length === 0 ? (
        <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container-lowest rounded-xl border border-surface-container-high">
          Belum ada data keahlian.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skills.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-3 hover:border-outline-variant/60 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-on-surface">{s.category}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container/30"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {s.items.map((it, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-surface-container text-xs text-on-surface font-medium border border-surface-container-high"
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
