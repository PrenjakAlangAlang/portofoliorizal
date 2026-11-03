'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Profile } from '@/lib/types';
import { uploadFileWithProgress } from '@/lib/upload-helper';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [cvUploadProgress, setCvUploadProgress] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/admin/profile')
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setFeedback({
          type: 'error',
          text: 'Gagal mengambil data profil dari server.',
        });
        setLoading(false);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!profile) return;
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = async (file: File, type: 'avatar' | 'cv') => {
    // Validasi ukuran berkas maksimal 50 MB
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFeedback({
        type: 'error',
        text: `Ukuran berkas (${sizeMb} MB) melebihi batas maksimal 50 MB. Silakan pilih berkas yang lebih kecil.`,
      });
      return;
    }

    if (type === 'avatar') {
      setUploadingAvatar(true);
    } else {
      setUploadingCv(true);
      setCvUploadProgress(0);
    }
    setFeedback(null);

    try {
      const data = await uploadFileWithProgress(file, (percent) => {
        if (type === 'cv') setCvUploadProgress(percent);
      });

      if (data && data.url) {
        if (type === 'avatar') {
          setProfile((prev) => (prev ? { ...prev, avatar_url: data.url } : null));
          setFeedback({ type: 'success', text: 'Foto profil berhasil diunggah!' });
        } else {
          setProfile((prev) => (prev ? { ...prev, cv_url: data.url } : null));
          setFeedback({ type: 'success', text: 'Dokumen CV berhasil diunggah!' });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengunggah file.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      if (type === 'avatar') {
        setUploadingAvatar(false);
      } else {
        setUploadingCv(false);
        setCvUploadProgress(null);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setFeedback({
          type: 'success',
          text: 'Profil berhasil diperbarui dan tersimpan!',
        });
      } else {
        const errorData = await res.json();
        setFeedback({
          type: 'error',
          text: errorData.error || 'Gagal menyimpan perubahan profil.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        text: 'Terjadi kesalahan jaringan saat menyimpan data.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-on-surface-variant">
        Memuat data profil...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-xs text-error font-mono">
        Profil tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Ubah Profil Geologis</h1>
        <p className="text-xs text-on-surface-variant pt-1">
          Perbarui informasi bio, gelar, afiliasi akademik, status ketersediaan, serta unggah berkas foto dan dokumen CV langsung.
        </p>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identitas Utama */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-4">
          <h2 className="text-sm font-bold text-on-surface border-b border-surface-container-high pb-2">
            Identitas &amp; Gelar
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Nama Lengkap &amp; Gelar
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-medium focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Spesialisasi / Role Title
              </label>
              <input
                type="text"
                name="title"
                value={profile.title}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-medium focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface">
              Ringkasan Bio / Tentang Saya
            </label>
            <textarea
              name="bio"
              rows={4}
              value={profile.bio}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm leading-relaxed focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Upload Foto Profil & Dokumen CV Langsung Berupa File */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-5">
          <h2 className="text-sm font-bold text-on-surface border-b border-surface-container-high pb-2 flex items-center justify-between">
            <span>Unggah Berkas Foto Profil &amp; Dokumen CV</span>
            <span className="text-[11px] font-mono text-tertiary font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              Upload File Langsung
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Foto Profil Upload */}
            <div className="p-4 rounded-xl bg-surface border border-outline-variant/40 space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">account_box</span>
                <span className="text-xs font-bold text-on-surface">Foto Profil Geologis</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-primary/30 bg-surface-container flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatar_url}
                    alt="Preview Foto"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 flex-1">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'avatar');
                    }}
                  />

                  <button
                    type="button"
                    disabled={uploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">upload_file</span>
                    <span>{uploadingAvatar ? 'Mengunggah...' : 'Pilih File Foto'}</span>
                  </button>
                  <p className="text-[10px] text-on-surface-variant font-mono">
                    Format: JPG, PNG, WEBP (Maks 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Dokumen CV Upload */}
            <div className="p-4 rounded-xl bg-surface border border-outline-variant/40 space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">description</span>
                <span className="text-xs font-bold text-on-surface">Dokumen Curriculum Vitae (CV)</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container text-xs font-mono text-on-surface truncate">
                  <span className="material-symbols-outlined text-primary text-base flex-shrink-0">attachment</span>
                  <span className="truncate flex-1">
                    {profile.cv_url && profile.cv_url !== '#resume'
                      ? profile.cv_url.split('/').pop() || 'Dokumen CV Terunggah'
                      : 'Belum ada dokumen CV diunggah'}
                  </span>
                  {profile.cv_url && profile.cv_url !== '#resume' && (
                    <a
                      href={profile.cv_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-bold text-[11px] flex-shrink-0"
                    >
                      Buka
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    ref={cvInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'cv');
                    }}
                  />

                  <button
                    type="button"
                    disabled={uploadingCv}
                    onClick={() => cvInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-secondary hover:bg-on-surface text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-base ${uploadingCv ? 'animate-spin' : ''}`}>
                      {uploadingCv ? 'sync' : 'upload'}
                    </span>
                    <span>
                      {uploadingCv
                        ? cvUploadProgress !== null
                          ? `Mengunggah CV... ${cvUploadProgress}%`
                          : 'Mengunggah CV...'
                        : 'Pilih File CV (PDF)'}
                    </span>
                  </button>
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    Format: PDF, DOCX (Maks 50 MB)
                  </span>
                </div>

                {/* Progress Bar Loading 0-100% untuk CV */}
                {uploadingCv && cvUploadProgress !== null && (
                  <div className="w-full space-y-1.5 pt-1 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-secondary font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                        {cvUploadProgress < 100
                          ? `Mengunggah CV ke server... (${cvUploadProgress}%)`
                          : 'Menyimpan berkas di server... 100%'}
                      </span>
                      <span className="text-on-surface font-bold font-mono">{cvUploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/40">
                      <div
                        className="h-full bg-secondary rounded-full transition-all duration-150 ease-out shadow-xs"
                        style={{ width: `${cvUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pendidikan & Metadata Geologi */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-4">
          <h2 className="text-sm font-bold text-on-surface border-b border-surface-container-high pb-2">
            Pendidikan &amp; Metadata Wilayah
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Jenjang Pendidikan
              </label>
              <input
                type="text"
                name="education"
                value={profile.education}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Universitas / Almamater
              </label>
              <input
                type="text"
                name="university"
                value={profile.university}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Domisili Operasional
              </label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Nilai IPK (Indeks Prestasi Kumulatif)
              </label>
              <input
                type="text"
                name="certification_badge"
                placeholder="Contoh: 3.75 / 4.00 atau 3.80"
                value={profile.certification_badge}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface">
              Kutipan Geologi / Quote Footer
            </label>
            <input
              type="text"
              name="quote"
              value={profile.quote}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm italic focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Kontak & Media Sosial */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-4">
          <h2 className="text-sm font-bold text-on-surface border-b border-surface-container-high pb-2">
            Kontak &amp; Tautan Profil
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Alamat Email
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Nomor WhatsApp / Telp
              </label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface">
              LinkedIn URL
            </label>
            <input
              type="url"
              name="linkedin_url"
              value={profile.linkedin_url || ''}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving || uploadingAvatar || uploadingCv}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>{saving ? 'Menyimpan Perubahan...' : 'Simpan Profil'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
