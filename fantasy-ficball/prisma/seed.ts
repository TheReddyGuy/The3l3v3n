import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const league = await prisma.league.create({
    data: {
      name: 'FicBall Premier',
      stats: {
        create: [
          { key: 'HR', name: 'Home Run' },
          { key: 'RBI', name: 'Runs Batted In' },
          { key: 'MAGIC', name: 'Magic Power' },
          { key: 'LUCK', name: 'Luck' }
        ]
      }
    }
  });

  const [hr, rbi, magic, luck] = await prisma.statCategory.findMany({
    where: { leagueId: league.id },
    orderBy: { id: 'asc' }
  });

  await prisma.scoringRule.createMany({
    data: [
      { leagueId: league.id, statCategoryId: hr.id, weight: 4 },
      { leagueId: league.id, statCategoryId: rbi.id, weight: 1 },
      { leagueId: league.id, statCategoryId: magic.id, weight: 2.5 },
      { leagueId: league.id, statCategoryId: luck.id, weight: 0.5 }
    ]
  });

  const teamA = await prisma.team.create({
    data: { name: 'Moonlit Pups', leagueId: league.id }
  });
  const teamB = await prisma.team.create({
    data: { name: 'Azure Mages', leagueId: league.id }
  });

  const scamp = await prisma.player.create({
    data: {
      name: 'Scamp the Wild Pup',
      gender: 'Pup',
      pronouns: 'he/they',
      positions: JSON.stringify(['OF', 'Utility'])
    }
  });

  const angel = await prisma.player.create({
    data: {
      name: 'Angel Toulouse',
      gender: 'Angel',
      pronouns: 'she/her',
      positions: JSON.stringify(['IF'])
    }
  });

  const mage = await prisma.player.create({
    data: {
      name: 'Mage Pitcher',
      gender: 'Mage',
      pronouns: 'they/them',
      positions: JSON.stringify(['MP'])
    }
  });

  await prisma.rosterEntry.createMany({
    data: [
      { teamId: teamA.id, playerId: scamp.id, role: 'Starter' },
      { teamId: teamA.id, playerId: angel.id, role: 'Starter' },
      { teamId: teamB.id, playerId: mage.id, role: 'Starter' }
    ]
  });

  const season = await prisma.season.create({
    data: { leagueId: league.id, year: 2025 }
  });

  await prisma.week.createMany({
    data: [
      { seasonId: season.id, number: 1 },
      { seasonId: season.id, number: 2 },
      { seasonId: season.id, number: 3 }
    ]
  });

  const week1 = await prisma.week.findFirstOrThrow({
    where: { seasonId: season.id, number: 1 }
  });

  await prisma.matchup.create({
    data: {
      weekId: week1.id,
      homeTeamId: teamA.id,
      awayTeamId: teamB.id
    }
  });

  await prisma.playerStat.createMany({
    data: [
      { playerId: scamp.id, statCategoryId: hr.id, value: 2, weekId: week1.id },
      { playerId: scamp.id, statCategoryId: luck.id, value: 5, weekId: week1.id },
      { playerId: angel.id, statCategoryId: rbi.id, value: 3, weekId: week1.id },
      { playerId: mage.id, statCategoryId: magic.id, value: 7, weekId: week1.id }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
