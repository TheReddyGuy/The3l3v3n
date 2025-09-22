import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const id = Number(params.id);
  const rule = await prisma.scoringRule.findUnique({ where: { id } });
  if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rule);
}

export async function PATCH(req: Request, { params }: Params) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.scoringRule.update({
    where: { id },
    data: { weight: body.weight }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = Number(params.id);
  await prisma.scoringRule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
