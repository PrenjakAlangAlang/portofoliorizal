import React from 'react';
import Link from 'next/link';
import {
  getProfile,
  getExperiences,
  getProjects,
  getCertifications,
  getSkills,
  getContactMessages,
} from '@/lib/data-store';

export default async function AdminDashboardPage() {
  const [profile, experiences, projects, certifications, skills, messages] = await Promise.all([
    getProfile(),
    getExperiences(),
    getProjects(),
    getCertifications(),
    getSkills(),
    getContactMessages(),
  ]);

  const unreadMessagesCount = messages.filter((m) => !m.is_read).length;

  const stats = [
    {
      label: 'Pengalaman Kerja',
      count: experiences.length,
      icon: 'history_edu',
      href: '/admin/experiences',
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Pengalaman Proyek',
      count: projects.length,
      icon: 'explore',
      href: '/admin/projects',
      color: 'bg-secondary/10 text-secondary',
    },
    {
      label: 'Sertifikasi & Pelatihan',
      count: certifications.length,
      icon: 'workspace_premium',
      href: '/admin/certifications',
      color: 'bg-tertiary/10 text-tertiary',
    },
    {
      label: 'Kategori Keahlian',
      count: skills.length,
      icon: 'build',
      href: '/admin/skills',
      color: 'bg-primary-container/20 text-primary',
    },
    {
      label: 'Pesan Masuk',
      count: messages.length,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} baru` : null,
      icon: 'mail',
      href: '/admin/contact',
      color: 'bg-error-container/40 text-error',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xs">
        <div>
          <span className="font-mono text-xs font-semibold text-primary uppercase tracking-wider">
            Dashboard Kontrol
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
            Selamat Datang, {profile.name}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant pt-1">
            Kelola profil, portofolio proyek, sertifikasi, riwayat kerja, dan pesan masuk.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="p-5 rounded-xl bg-surface-container-lowest border border-surface-container-high hover:border-primary/40 hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs text-on-surface-variant font-medium">
                {s.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-on-surface group-hover:text-primary transition-colors">
                  {s.count}
                </span>
                {s.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-error text-white font-mono text-[10px] font-bold">
                    {s.badge}
                  </span>
                )}
              </div>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${s.color}`}
            >
              <span className="material-symbols-outlined text-2xl">{s.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Profile Summary Card */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-4">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
            <h2 className="text-sm font-bold text-on-surface">Status Profil Publik</h2>
            <Link
              href="/admin/profile"
              className="text-xs font-mono text-primary hover:underline font-semibold"
            >
              Ubah
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-14 h-14 rounded-xl object-cover ring-2 ring-primary/20"
            />
            <div className="leading-tight">
              <h3 className="font-bold text-sm text-on-surface">{profile.name}</h3>
              <p className="text-xs text-primary font-medium line-clamp-1">
                {profile.title}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-on-surface-variant pt-2 border-t border-surface-container-high/60">
            <div>
              <span className="font-semibold text-on-surface">Email:</span> {profile.email}
            </div>
            <div>
              <span className="font-semibold text-on-surface">WhatsApp:</span> {profile.phone}
            </div>
            <div>
              <span className="font-semibold text-on-surface">Domisili:</span> {profile.location}
            </div>
          </div>
        </div>

        {/* Recent Messages Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-4">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-on-surface">Pesan Masuk Terbaru</h2>
              {unreadMessagesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-error text-white text-[10px] font-mono font-bold">
                  {unreadMessagesCount} Belum Dibaca
                </span>
              )}
            </div>
            <Link
              href="/admin/contact"
              className="text-xs font-mono text-primary hover:underline font-semibold"
            >
              Lihat Semua
            </Link>
          </div>

          {messages.length === 0 ? (
            <p className="text-xs text-on-surface-variant py-8 text-center">
              Belum ada pesan masuk dari pengunjung.
            </p>
          ) : (
            <div className="space-y-3">
              {messages.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1 transition-all ${
                    !m.is_read
                      ? 'bg-primary-fixed/20 border-primary/30'
                      : 'bg-surface border-surface-container-high'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-on-surface">{m.name}</span>
                    <span className="font-mono text-[10px] text-on-surface-variant">
                      {new Date(m.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="font-medium text-primary line-clamp-1">
                    {m.subject}
                  </div>
                  <p className="text-on-surface-variant line-clamp-2">{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
