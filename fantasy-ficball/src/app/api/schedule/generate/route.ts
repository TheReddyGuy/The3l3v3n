import { NextResponse } from 'next/server';
import { generateRoundRobinSchedule } from '@/lib/schedule';

export async function POST(req: Request) {
  const body = await req.json();
  const result = await generateRoundRobinSchedule(Number(body.seasonId));
  return NextResponse.json(result);
}
