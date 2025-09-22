import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const id = Number(params.id);
  const season = await prisma.season.findUnique({ where: { id }, include: { weeks: true, league: true } });
  if (!season) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(season);
}

export async function PATCH(req: Request, { params }: Params) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.season.update({ where: { id }, data: { year: body.year } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = Number(params.id);
  await prisma.season.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
