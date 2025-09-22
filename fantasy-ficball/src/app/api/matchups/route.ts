import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const matchups = await prisma.matchup.findMany({ include: { week: true, homeTeam: true, awayTeam: true } as any });
  return NextResponse.json(matchups);
}

export async function POST(req: Request) {
  const body = await req.json();
  const matchup = await prisma.matchup.create({
    data: {
      weekId: body.weekId,
      homeTeamId: body.homeTeamId,
      awayTeamId: body.awayTeamId
    }
  });
  return NextResponse.json(matchup, { status: 201 });
}
