import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const id = Number(params.id);
  const stat = await prisma.statCategory.findUnique({ where: { id } });
  if (!stat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(stat);
}

export async function PATCH(req: Request, { params }: Params) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.statCategory.update({
    where: { id },
    data: { key: body.key, name: body.name }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = Number(params.id);
  await prisma.statCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
