import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const rules = await prisma.scoringRule.findMany();
  return NextResponse.json(rules);
}

export async function POST(req: Request) {
  const body = await req.json();
  const rule = await prisma.scoringRule.create({
    data: {
      leagueId: body.leagueId,
      statCategoryId: body.statCategoryId,
      weight: body.weight
    }
  });
  return NextResponse.json(rule, { status: 201 });
}
