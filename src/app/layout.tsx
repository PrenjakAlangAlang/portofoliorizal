import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Novrijal Ramadhany | Geological Engineering',
  description:
    'Portofolio Profesional Geologi Eksplorasi, Pemetaan Hidrotermal, Analisis Sedimentologi, dan Pemodelan Spasial 3D - Novrijal Ramadhany, S.T.',
  keywords: [
    'Novrijal Ramadhany',
    'Geologist',
    'Geological Engineering',
    'Teknik Geologi',
    'Geologi Eksplorasi',
    'UPN Veteran Yogyakarta',
    'Indonesia',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-surface font-sans text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col transition-colors duration-200"
      >
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
