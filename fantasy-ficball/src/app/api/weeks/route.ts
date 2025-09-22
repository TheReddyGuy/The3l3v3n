import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const weeks = await prisma.week.findMany({ include: { season: true, matchups: true } });
  return NextResponse.json(weeks);
}

export async function POST(req: Request) {
  const body = await req.json();
  const week = await prisma.week.create({
    data: { seasonId: body.seasonId, number: body.number }
  });
  return NextResponse.json(week, { status: 201 });
}
