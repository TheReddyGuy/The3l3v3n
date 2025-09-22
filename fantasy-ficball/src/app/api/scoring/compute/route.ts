import { NextResponse } from 'next/server';
import { computeTeamScoresForWeek } from '@/lib/scoring';

export async function POST(req: Request) {
  const body = await req.json();
  const scores = await computeTeamScoresForWeek(Number(body.weekId));
  return NextResponse.json(scores);
}
