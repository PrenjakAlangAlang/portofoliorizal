# 🌋 Geologist Portfolio & Admin Portal (Next.js + Supabase + Vercel)

Website portofolio profesional untuk Geologis dan Spesialis Eksplorasi & Pemodelan 3D, terinspirasi oleh desain presisi kartografi & stratigrafi kebumian. Dilengkapi dengan **Dashboard Admin lengkap** dan **URL login khusus rahasia**, siap di-deploy langsung ke **Vercel** dengan database **Supabase**.

---

## 🌟 Fitur Utama

1. **Frontend Portofolio Berpresisi Tinggi:**
   - **Profil & Identitas Geologis:** Bio, spesialisasi, status ketersediaan, almamater, sertifikasi utama, IPK, dan foto profil.
   - **Pengalaman Kerja (Career Stratigraphy):** Riwayat karir terstruktur dengan tag kompetensi.
   - **Pengalaman Proyek (Field Portfolio):** Dokumentasi foto lapangan, lokasi cekungan geologi, durasi survei, deskripsi metodologi, dan deliverable spesifik.
   - **Sertifikasi & Pelatihan:** Lisensi operasional.
   - **Keahlian Teknis Terkategori:** Geologi Lapangan, Software & GIS, Laboratorium, serta Kepatuhan & Standar K3 (JORC/KCMI).
   - **Hubungi Saya & Formulir Pesan Interaktif:** Calon klien dapat mengirim pesan langsung dari website yang langsung masuk ke dashboard admin, serta tombol WhatsApp dan Email langsung.
   - **Footer Berisi Datum & Koordinat Geologi:** Menampilkan datum `WGS 84 / UTM ZONE 49S` dan tautan LinkedIn, ResearchGate, dan GitHub.
   - **Bilingual Switcher (ID | EN) & Unduh CV PDF.**

2. **Dashboard Admin Mandiri (`/admin`):**
   - **Ubah Profil:** Edit nama, bio, foto, kontak, link CV, kutipan litosfer, dan afiliasi.
   - **Kelola Pengalaman Kerja:** Tambah, edit, hapus, dan atur tag keahlian.
   - **Kelola Pengalaman Proyek:** Tambah, edit, hapus, kelola foto lapangan & deliverable.
   - **Kelola Sertifikasi:** Tambah lisensi dan pelatihan baru lengkap dengan tahun & lembaga penerbit.
   - **Kelola Keahlian Teknis:** Atur kategori, ikon domain, dan daftar keahlian/software.
   - **Hubungi Saya & Kotak Pesan:** Baca pesan masuk dari form website, tandai sudah dibaca, balas via WhatsApp/Email dengan satu klik.
   - **Status Koneksi & Database:** Cek integrasi Supabase secara real-time.

3. **URL Khusus Login Admin (Secret Portal):**
   - Akses `/admin` diproteksi secara ketat. Pengunjung umum yang mencoba membuka `/admin` akan langsung dialihkan ke halaman utama tanpa membocorkan halaman login.
   - Login admin menggunakan URL khusus: `/portal-admin-geolog` (dapat diubah sesuai keinginan di `.env.local` melalui variabel `NEXT_PUBLIC_ADMIN_SECRET_PATH`).

4. **Dual-Mode Data (Online Supabase & Offline Fallback):**
   - **Bila Supabase sudah terhubung:** Data disimpan dan dibaca langsung dari database PostgreSQL Supabase secara realtime.
   - **Bila Supabase belum diisi:** Website tetap berjalan mulus dengan data bawaan tanpa error crash, sehingga Anda dapat langsung menjalankan dan menguji aplikasi secara instan.

---

## 🗄️ Struktur Proyek

```
geologist-portfolio/
├── supabase/
│   └── schema.sql              <-- Skrip pembuatan tabel database, RLS, & seed data
├── src/
│   ├── app/
│   │   ├── admin/              <-- Dashboard Admin
│   │   │   ├── certifications/ <-- Kelola sertifikasi
│   │   │   ├── contact/        <-- Kelola kontak & pesan masuk
│   │   │   ├── experiences/    <-- Kelola riwayat kerja
│   │   │   ├── profile/        <-- Ubah profil & bio
│   │   │   ├── projects/       <-- Kelola portofolio proyek
│   │   │   ├── settings/       <-- Status koneksi Supabase & panduan
│   │   │   ├── skills/         <-- Kelola keahlian teknis
│   │   │   ├── layout.tsx      <-- Guard autentikasi admin & navigasi sidebar
│   │   │   └── page.tsx        <-- Ringkasan statistik & pesan terbaru
│   │   ├── api/
│   │   │   ├── admin/          <-- Endpoint REST API untuk CRUD data admin
│   │   │   ├── auth/           <-- Login & logout session
│   │   │   └── contact/        <-- Form submission publik
│   │   ├── portal-admin-geolog/<-- URL KHUSUS LOGIN ADMIN
│   │   ├── globals.css         <-- Design tokens Tailwind Stratum & Field
│   │   ├── layout.tsx          <-- Root layout dengan Google Fonts & meta tags
│   │   └── page.tsx            <-- Halaman publik portofolio geologi
│   ├── components/             <-- Komponen UI (Header, Hero, Projects, Skills, dll)
│   └── lib/
│       ├── auth.ts             <-- Manajemen sesi & cookie login admin
│       ├── data-store.ts       <-- Data access layer (Supabase + fallback)
│       ├── initial-data.ts     <-- Data awal spesimen portofolio
│       ├── supabase.ts         <-- Client koneksi Supabase
│       └── types.ts            <-- Definisi TypeScript
├── .env.example                <-- Panduan variabel lingkungan
├── .env.local                  <-- Konfigurasi lokal
└── next.config.ts              <-- Konfigurasi Next.js
```

---

## 🚀 Panduan Menjalankan di Komputer Lokal

1. Buka terminal di folder proyek:
   ```bash
   cd geologist-portfolio
   ```

2. Jalankan development server:
   ```bash
   npm run dev
   ```



---

## 🗃️ Langkah Menghubungkan Database Supabase

1. Daftar atau buka akun di [https://supabase.com](https://supabase.com) dan buat **New Project**.
2. Di sidebar Supabase, buka menu **SQL Editor**.
3. Buka file `supabase/schema.sql` pada proyek ini, copy seluruh isinya, lalu paste ke SQL Editor Supabase dan klik **Run**.
   - *Skrip ini akan otomatis membuat tabel `profiles`, `experiences`, `projects`, `certifications`, `skills`, `contact_messages`, mengaktifkan Row Level Security (RLS), dan mengisikan data awal.*
4. Buka **Project Settings** > **API**, salin:
   - **Project URL**
   - **Project API Keys (`anon` / `public`)**
5. Masukkan ke file `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh......
   ADMIN_PASSWORD=geolog2026
   NEXT_PUBLIC_ADMIN_SECRET_PATH=/portal-admin-geolog
   ```
6. Restart server `npm run dev`. Website kini terhubung penuh ke Supabase!

---

