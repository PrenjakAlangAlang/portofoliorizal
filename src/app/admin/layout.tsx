import React from 'react';
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();

  // If not authenticated, do not reveal the secret login path.
  // Redirect to home page instead.
  if (!authed) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col md:flex-row text-on-surface">
      <AdminNav />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
