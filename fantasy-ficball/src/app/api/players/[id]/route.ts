import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const id = Number(params.id);
  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    const positions = JSON.parse(player.positions as unknown as string);
    return NextResponse.json({ ...player, positions });
  } catch {
    return NextResponse.json({ ...player, positions: [] });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.player.update({
    where: { id },
    data: {
      name: body.name,
      gender: body.gender,
      pronouns: body.pronouns,
      positions: body.positions ? JSON.stringify(body.positions) : undefined
    }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = Number(params.id);
  await prisma.player.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
