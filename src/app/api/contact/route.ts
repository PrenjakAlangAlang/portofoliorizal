import { NextResponse } from 'next/server';
import { submitContactMessage } from '@/lib/data-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nama, Email, dan Pesan wajib diisi.' },
        { status: 400 }
      );
    }

    const saved = await submitContactMessage({
      name,
      email,
      phone: phone || '',
      subject: subject || 'Pesan Baru dari Website Portofolio',
      message,
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memproses pesan.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
