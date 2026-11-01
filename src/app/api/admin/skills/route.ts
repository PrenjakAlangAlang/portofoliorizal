import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAuthenticated } from '@/lib/auth';
import { getSkills, saveSkillCategory, deleteSkillCategory } from '@/lib/data-store';

export async function GET() {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const skills = await getSkills();
  return NextResponse.json(skills);
}

export async function POST(request: Request) {
  const auth = await isAuthenticated();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const item = await request.json();
    if (!item.id) {
      item.id = `skill-${Date.now()}`;
    }
    const saved = await saveSkillCategory(item);
    revalidatePath('/');
    return NextResponse.json({ success: true, data: saved });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save skill category';
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

    await deleteSkillCategory(id);
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete skill category';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
