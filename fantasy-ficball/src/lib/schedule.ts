import { prisma } from '@/lib/prisma';

export async function generateRoundRobinSchedule(seasonId: number) {
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
    include: { league: { include: { teams: true } }, weeks: true }
  });
  if (!season) throw new Error('Season not found');
  const teams = season.league.teams;
  if (teams.length < 2) return { createdWeeks: 0, createdMatchups: 0 };

  // Ensure there are enough weeks (n-1 if even, n if odd, to account for byes)
  const teamCount = teams.length;
  const weeksNeeded = teamCount % 2 === 0 ? teamCount - 1 : teamCount;
  const existingWeekNumbers = new Set(season.weeks.map((w) => w.number));

  const weeksToEnsure: number[] = [];
  for (let i = 1; i <= weeksNeeded; i++) {
    if (!existingWeekNumbers.has(i)) weeksToEnsure.push(i);
  }

  if (weeksToEnsure.length > 0) {
    await prisma.week.createMany({
      data: weeksToEnsure.map((n) => ({ seasonId, number: n }))
    });
  }

  const weeks = await prisma.week.findMany({
    where: { seasonId },
    orderBy: { number: 'asc' }
  });

  // Round-robin algorithm (circle method)
  const teamIds = teams.map((t) => t.id);
  let byeTeamId: number | null = null;
  let rotation: number[] = [...teamIds];
  if (rotation.length % 2 === 1) {
    byeTeamId = -1; // sentinel for bye
    rotation.push(byeTeamId);
  }

  const half = rotation.length / 2;
  let createdMatchups = 0;

  for (let round = 0; round < weeks.length; round++) {
    const week = weeks[round];
    const pairs: Array<{ home: number; away: number }> = [];
    for (let i = 0; i < half; i++) {
      const home = rotation[i];
      const away = rotation[rotation.length - 1 - i];
      if (home !== byeTeamId && away !== byeTeamId) {
        // Alternate home/away by round to balance
        if (round % 2 === 0) pairs.push({ home, away });
        else pairs.push({ home: away, away: home });
      }
    }

    for (const p of pairs) {
      // Skip if matchup already exists for this week and teams
      const exists = await prisma.matchup.findFirst({
        where: {
          weekId: week.id,
          OR: [
            { homeTeamId: p.home, awayTeamId: p.away },
            { homeTeamId: p.away, awayTeamId: p.home }
          ]
        }
      });
      if (!exists) {
        await prisma.matchup.create({
          data: { weekId: week.id, homeTeamId: p.home, awayTeamId: p.away }
        });
        createdMatchups += 1;
      }
    }

    // rotate (keep first fixed)
    const fixed = rotation[0];
    const tail = rotation.slice(1);
    const moved = tail.pop();
    if (moved !== undefined) tail.unshift(moved);
    rotation = [fixed, ...tail];
  }

  return { createdWeeks: weeksToEnsure.length, createdMatchups };
}
