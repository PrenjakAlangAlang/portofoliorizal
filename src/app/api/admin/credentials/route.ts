import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAdminCredentials, updateAdminCredentials } from '@/lib/data-store';

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const creds = await getAdminCredentials();
    return NextResponse.json({ username: creds.username });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch credentials';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newUsername, newPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Kata sandi saat ini wajib diisi untuk konfirmasi keamanan.' },
        { status: 400 }
      );
    }

    const currentCreds = await getAdminCredentials();

    if (currentCreds.password !== currentPassword) {
      return NextResponse.json(
        { error: 'Kata sandi saat ini tidak sesuai / salah.' },
        { status: 401 }
      );
    }

    const usernameToSave = (newUsername && newUsername.trim()) || currentCreds.username;
    if (usernameToSave.length < 3) {
      return NextResponse.json(
        { error: 'Username minimal harus terdiri dari 3 karakter.' },
        { status: 400 }
      );
    }

    let passwordToSave = currentCreds.password;
    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { error: 'Kata sandi baru minimal harus terdiri dari 6 karakter.' },
          { status: 400 }
        );
      }
      passwordToSave = newPassword.trim();
    }

    const updated = await updateAdminCredentials(usernameToSave, passwordToSave);

    return NextResponse.json({
      success: true,
      username: updated.username,
      message: 'Username dan kata sandi admin berhasil diperbarui.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update credentials';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
