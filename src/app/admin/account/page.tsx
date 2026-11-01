'use client';

import React, { useState, useEffect } from 'react';

export default function AdminAccountPage() {
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadCreds() {
      try {
        const res = await fetch('/api/admin/credentials');
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username || 'admin');
          setNewUsername(data.username || 'admin');
        }
      } catch (e) {
        console.error('Failed to load credentials:', e);
      } finally {
        setLoading(false);
      }
    }
    loadCreds();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentPassword) {
      setFeedback({
        type: 'error',
        text: 'Kata sandi saat ini wajib diisi untuk verifikasi keamanan.',
      });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setFeedback({
        type: 'error',
        text: 'Kata sandi baru minimal harus terdiri dari 6 karakter.',
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setFeedback({
        type: 'error',
        text: 'Konfirmasi kata sandi baru tidak cocok.',
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: 'success',
          text: data.message || 'Username dan kata sandi berhasil diperbarui ke database!',
        });
        setUsername(data.username);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFeedback({
          type: 'error',
          text: data.error || 'Gagal memperbarui kredensial.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        text: 'Terjadi kesalahan jaringan saat memperbarui kredensial.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-2xl">manage_accounts</span>
          <span>Keamanan &amp; Akun Admin</span>
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant pt-1">
          Kelola username dan kata sandi yang digunakan untuk mengakses portal administrator portofolio geologi.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-150 ${
            feedback.type === 'success'
              ? 'bg-tertiary-container/30 border-tertiary/40 text-tertiary'
              : 'bg-error-container/40 border-error/40 text-error'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {feedback.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-6">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Ubah Username &amp; Kata Sandi</h2>
              <span className="text-[11px] text-on-surface-variant">
                Username aktif saat ini:{' '}
                <strong className="font-mono text-primary">{loading ? 'Memuat...' : username}</strong>
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Username Admin Baru
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Masukkan username baru..."
                  className="w-full pl-10 pr-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-medium focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant text-lg">
                  account_circle
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Digunakan untuk login di halaman portal admin rahasia.
              </p>
            </div>

            <div className="pt-2 border-t border-surface-container-high"></div>

            {/* Current Password (Required for verification) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Kata Sandi Saat Ini <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi yang sedang aktif..."
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant text-lg">
                  lock
                </span>
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2 text-on-surface-variant hover:text-on-surface"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showCurrent ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Wajib diisi untuk membuktikan identitas sebelum perubahan disimpan ke database.
              </p>
            </div>

            {/* New Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Kata Sandi Baru (Opsional)
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak ingin diubah"
                    className="w-full pl-10 pr-10 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant text-lg">
                    key
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2 text-on-surface-variant hover:text-on-surface"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showNew ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <span className="text-[10px] text-on-surface-variant">Minimal 6 karakter.</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Ulangi Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru..."
                    className="w-full pl-10 pr-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant text-lg">
                    check_circle
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>{saving ? 'Menyimpan ke Database...' : 'Simpan Kredensial Baru'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <span className="material-symbols-outlined text-lg">shield</span>
              <span>Pusat Keamanan</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Username dan password baru langsung tersinkronisasi ke tabel database Supabase Anda (`admin_credentials`) serta memori sistem.
            </p>
            <div className="space-y-2 pt-2 border-t border-surface-container-high text-xs text-on-surface">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-tertiary text-sm mt-0.5">check</span>
                <span>Tersimpan aman di database PostgreSQL Supabase.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-tertiary text-sm mt-0.5">check</span>
                <span>Sesi login aman selama 7 hari via HttpOnly Cookie.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-tertiary text-sm mt-0.5">check</span>
                <span>Dapat diubah kapan saja tanpa perlu deploy ulang.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
