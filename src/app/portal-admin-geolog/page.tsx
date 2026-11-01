'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function SecretAdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Username atau kata sandi salah.');
      }
    } catch {
      setError('Terjadi masalah jaringan saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center px-4 topo-bg relative">
      {/* Top Floating Actions: Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          type="button"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface transition-all cursor-pointer shadow-md active:scale-95"
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          aria-label="Toggle theme"
        >
          <span className="material-symbols-outlined text-xl">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>

      <div className="w-full max-w-md p-8 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header / Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
            Portal Khusus Geologis
          </h1>
          <p className="text-xs text-on-surface-variant font-mono">
            Pusat Kendali &amp; Manajemen Portofolio
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-error-container/40 border border-error-container text-error text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface">
              Username Admin
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Masukkan username admin..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-outline-variant/60 bg-surface focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
                autoFocus
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">
                account_circle
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface">
              Kata Sandi / Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-outline-variant/60 bg-surface focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-mono transition-all"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">
                key
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white text-sm font-semibold transition-all shadow-sm active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <span className="material-symbols-outlined text-lg">login</span>
            <span>{loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-surface-container-high text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-mono text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Kembali ke Website Portofolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
