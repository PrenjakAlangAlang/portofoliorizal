import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getContactMessages, toggleMessageRead, deleteMessage } from '@/lib/data-store';

export async function GET() {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const messages = await getContactMessages();
  return NextResponse.json(messages);
}

export async function PATCH(request: Request) {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, is_read } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await toggleMessageRead(id, is_read);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update message';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await deleteMessage(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete message';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
