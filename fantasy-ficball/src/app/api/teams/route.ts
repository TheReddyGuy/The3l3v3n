import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const teams = await prisma.team.findMany({ include: { roster: true } });
  return NextResponse.json(teams);
}

export async function POST(req: Request) {
  const body = await req.json();
  const team = await prisma.team.create({
    data: { name: body.name, leagueId: body.leagueId }
  });
  return NextResponse.json(team, { status: 201 });
}
