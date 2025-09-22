import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const seasons = await prisma.season.findMany({ include: { weeks: true } });
  return NextResponse.json(seasons);
}

export async function POST(req: Request) {
  const body = await req.json();
  const season = await prisma.season.create({
    data: { leagueId: body.leagueId, year: body.year }
  });
  return NextResponse.json(season, { status: 201 });
}
