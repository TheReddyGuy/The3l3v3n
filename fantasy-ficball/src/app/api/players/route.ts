import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const players = await prisma.player.findMany();
  const normalized = players.map((p) => ({
    ...p,
    positions: (() => {
      try { return JSON.parse(p.positions as unknown as string); } catch { return []; }
    })()
  }));
  return NextResponse.json(normalized);
}

export async function POST(req: Request) {
  const body = await req.json();
  const player = await prisma.player.create({
    data: {
      name: body.name,
      gender: body.gender,
      pronouns: body.pronouns,
      positions: JSON.stringify(body.positions ?? [])
    }
  });
  return NextResponse.json(player, { status: 201 });
}
