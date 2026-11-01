'use client';

import React, { useState, useEffect } from 'react';
import { ContactMessage, Profile } from '@/lib/types';

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingContact, setSavingContact] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/messages').then((res) => res.json()),
      fetch('/api/admin/profile').then((res) => res.json()),
    ])
      .then(([msgs, prof]) => {
        setMessages(msgs);
        setProfile(prof);
        setLoading(false);
      })
      .catch(() => {
        setFeedback({ type: 'error', text: 'Gagal memuat data kontak.' });
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_read: !currentRead }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, is_read: !currentRead } : m))
        );
      }
    } catch {
      setFeedback({ type: 'error', text: 'Gagal memperbarui status pesan.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pesan ini secara permanen?')) return;
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        setFeedback({ type: 'success', text: 'Pesan berhasil dihapus.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Gagal menghapus pesan.' });
    }
  };

  const handleSaveContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingContact(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
        }),
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: 'Informasi kontak berhasil disimpan!' });
      } else {
        setFeedback({ type: 'error', text: 'Gagal memperbarui kontak.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSavingContact(false);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Hubungi Saya &amp; Kotak Pesan</h1>
        <p className="text-xs text-on-surface-variant pt-1">
          Kelola nomor kontak WhatsApp, email resmi, lokasi operasional, dan baca pertanyaan masuk dari calon klien.
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

      {/* Contact Channels Form */}
      {profile && (
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-4">
          <h2 className="text-sm font-bold text-on-surface border-b border-surface-container-high pb-2">
            Saluran Kontak Utama (Tampil di Website)
          </h2>

          <form onSubmit={handleSaveContactInfo} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Email Profesional
                </label>
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="text"
                  required
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm font-mono focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">
                  Domisili Operasional
                </label>
                <input
                  type="text"
                  required
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-outline-variant/60 bg-surface text-xs sm:text-sm focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingContact}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                {savingContact ? 'Menyimpan...' : 'Perbarui Saluran Kontak'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages Inbox */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-on-surface">Pesan Masuk Pengunjung</h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-error text-white font-mono text-xs font-bold">
                {unreadCount} Baru
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-on-surface-variant">
            Total {messages.length} Pesan
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-on-surface-variant">
            Memuat kotak masuk...
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-surface-container-high">
            Kotak pesan masih kosong. Pesan yang dikirim melalui form kontak website akan tampil di sini.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  !m.is_read
                    ? 'bg-primary-fixed/20 border-primary/40 shadow-xs'
                    : 'bg-surface-container-lowest border-surface-container-high'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container-high pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        !m.is_read ? 'bg-error animate-pulse' : 'bg-surface-dim'
                      }`}
                      title={!m.is_read ? 'Belum dibaca' : 'Sudah dibaca'}
                    ></span>
                    <h3 className="font-bold text-sm text-on-surface">{m.name}</h3>
                    <span className="text-xs font-mono text-on-surface-variant">
                      &lt;{m.email}&gt;
                    </span>
                    {m.phone && (
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {m.phone}
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-[11px] text-on-surface-variant self-end sm:self-auto">
                    {new Date(m.created_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-primary">
                    {m.subject}
                  </h4>
                  <p className="text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-wrap bg-surface p-3.5 rounded-xl border border-outline-variant/30">
                    {m.message}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(m.email)}&su=${encodeURIComponent(`Balasan: ${m.subject}`)}&body=${encodeURIComponent(
                        `Halo ${m.name},\n\nTerima kasih atas pesan yang Anda kirimkan mengenai "${m.subject}".\n`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors"
                      title="Buka langsung di Gmail untuk membalas pesan"
                    >
                      <span className="material-symbols-outlined text-sm">mail</span>
                      <span>Balas Email (Gmail)</span>
                    </a>
                    
                    {m.phone && (
                      <a
                        href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-tertiary-fixed/40 hover:bg-tertiary-fixed text-tertiary text-xs font-semibold transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        <span>Balas WhatsApp</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRead(m.id, m.is_read)}
                      className="text-xs font-mono text-on-surface-variant hover:text-primary underline px-2 py-1"
                    >
                      {m.is_read ? 'Tandai Belum Dibaca' : 'Tandai Sudah Dibaca'}
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30"
                      title="Hapus Pesan"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
