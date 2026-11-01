'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const links = [
    { href: '/admin', label: 'Ringkasan Dashboard', icon: 'dashboard' },
    { href: '/admin/profile', label: 'Profil Saya', icon: 'person' },
    { href: '/admin/experiences', label: 'Pengalaman Kerja', icon: 'history_edu' },
    { href: '/admin/projects', label: 'Pengalaman Proyek', icon: 'explore' },
    { href: '/admin/certifications', label: 'Sertifikasi & Pelatihan', icon: 'workspace_premium' },
    { href: '/admin/highlights', label: 'Pencapaian & Sorotan', icon: 'insights' },
    { href: '/admin/skills', label: 'Keahlian Teknis', icon: 'build' },
    { href: '/admin/contact', label: 'Hubungi Saya & Pesan', icon: 'mail' },
    { href: '/admin/account', label: 'Keamanan Akun', icon: 'manage_accounts' },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch {
      router.push('/');
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden bg-surface-container-lowest border-b border-surface-container-high px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">terrain</span>
          </div>
          <span className="font-bold text-sm text-on-surface">Admin Geologi</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            type="button"
            className="p-1.5 rounded-lg text-on-surface hover:bg-surface-container transition-colors"
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined text-xl">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Toggle admin navigation"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-auto w-64 bg-surface-container-lowest border-r border-surface-container-high flex flex-col justify-between transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } h-screen`}
      >
        <div className="p-5 space-y-6">
          {/* Brand */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-xl">terrain</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-on-surface">Portal Admin</h2>
                <span className="text-[11px] font-mono text-primary font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  Online
                </span>
              </div>
            </div>
            {mobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions: Theme, View Site & Logout */}
        <div className="p-4 border-t border-surface-container-high space-y-2">
          <button
            onClick={toggleTheme}
            type="button"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors border border-outline-variant/30 cursor-pointer"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            <span className="material-symbols-outlined text-base">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <span>{theme === 'dark' ? 'Mode Terang (Light)' : 'Mode Gelap (Dark)'}</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            <span>Lihat Website Portofolio</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-error-container/30 hover:bg-error-container text-error text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>{loggingOut ? 'Keluar...' : 'Keluar Admin'}</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-2xs"
        />
      )}
    </>
  );
}
