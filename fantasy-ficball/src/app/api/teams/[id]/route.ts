import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const id = Number(params.id);
  const team = await prisma.team.findUnique({
    where: { id },
    include: { roster: { include: { player: true } }, league: true }
  });
  if (!team) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(team);
}

export async function PATCH(req: Request, { params }: Params) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.team.update({
    where: { id },
    data: { name: body.name }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = Number(params.id);
  await prisma.team.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
