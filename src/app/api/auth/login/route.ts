import { NextResponse } from 'next/server';
import { setAdminSession } from '@/lib/auth';
import { verifyAdminLogin } from '@/lib/data-store';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminLogin(username, password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Username atau kata sandi tidak sesuai.' },
        { status: 401 }
      );
    }

    await setAdminSession();
    return NextResponse.json({ success: true, redirect: '/admin' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
