import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const stats = await prisma.statCategory.findMany();
  return NextResponse.json(stats);
}

export async function POST(req: Request) {
  const body = await req.json();
  const stat = await prisma.statCategory.create({
    data: { key: body.key, name: body.name, leagueId: body.leagueId }
  });
  return NextResponse.json(stat, { status: 201 });
}
