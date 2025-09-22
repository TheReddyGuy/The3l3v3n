import { prisma } from '@/lib/prisma';

export type TeamWeekScore = {
  teamId: number;
  weekId: number;
  total: number;
  byStat: Record<string, number>;
};

export async function computeTeamScoresForWeek(weekId: number) {
  const week = await prisma.week.findUnique({
    where: { id: weekId },
    include: {
      season: { include: { league: { include: { scoring: { include: { statCategory: true } } } } } },
      matchups: { include: { homeTeam: true, awayTeam: true } }
    }
  });
  if (!week) throw new Error('Week not found');
  const league = week.season.league;

  const statKeyToWeight: Record<string, number> = {};
  for (const rule of league.scoring) {
    statKeyToWeight[rule.statCategory.key] = rule.weight;
  }

  const teamIds = new Set<number>();
  for (const m of week.matchups) {
    teamIds.add(m.homeTeamId);
    teamIds.add(m.awayTeamId);
  }

  // Pull player stats for players on those teams
  const rosterEntries = await prisma.rosterEntry.findMany({
    where: { teamId: { in: Array.from(teamIds) } },
    include: { player: true }
  });

  const playerIdsByTeamId = new Map<number, number[]>();
  for (const r of rosterEntries) {
    const list = playerIdsByTeamId.get(r.teamId) ?? [];
    list.push(r.playerId);
    playerIdsByTeamId.set(r.teamId, list);
  }

  const statsThisWeek = await prisma.playerStat.findMany({
    where: { weekId: week.id },
    include: { statCategory: true }
  });

  const result: TeamWeekScore[] = [];
  for (const teamId of teamIds) {
    const playerIds = new Set(playerIdsByTeamId.get(teamId) ?? []);
    const byStat: Record<string, number> = {};
    let total = 0;
    for (const s of statsThisWeek) {
      if (!playerIds.has(s.playerId)) continue;
      const key = s.statCategory.key;
      const weight = statKeyToWeight[key] ?? 0;
      const points = s.value * weight;
      byStat[key] = (byStat[key] ?? 0) + points;
      total += points;
    }
    result.push({ teamId, weekId: week.id, total, byStat });
  }

  return result;
}
