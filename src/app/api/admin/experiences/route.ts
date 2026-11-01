import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getExperiences, saveExperience, deleteExperience } from '@/lib/data-store';

export async function GET() {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const experiences = await getExperiences();
  return NextResponse.json(experiences);
}

export async function POST(request: Request) {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const item = await request.json();
    if (!item.id) {
      item.id = `exp-${Date.now()}`;
    }
    const saved = await saveExperience(item);
    return NextResponse.json({ success: true, data: saved });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save experience';
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

    await deleteExperience(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete experience';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
