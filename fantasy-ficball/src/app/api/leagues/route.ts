import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const leagues = await prisma.league.findMany({
    include: { teams: true, stats: true, scoring: true }
  });
  return NextResponse.json(leagues);
}

export async function POST(req: Request) {
  const body = await req.json();
  const league = await prisma.league.create({ data: { name: body.name } });
  return NextResponse.json(league, { status: 201 });
}
