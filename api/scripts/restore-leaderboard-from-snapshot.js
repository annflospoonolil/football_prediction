const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const snapshotPath = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.join(
        __dirname,
        '..',
        'backups',
        'score-snapshots',
        'score-snapshot-2026-06-28T17-20-21-554Z.json',
      );

  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const leaderboard = snapshot.leaderboard;

  if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
    throw new Error(`No leaderboard entries found in ${snapshotPath}`);
  }

  const snapshotAt = snapshot.summary?.exportedAt
    ? new Date(snapshot.summary.exportedAt)
    : new Date();

  await prisma.$transaction(
    leaderboard.map((entry) =>
      prisma.leaderboardScore.upsert({
        where: { userId: entry.userId },
        create: {
          userId: entry.userId,
          collegeId: entry.collegeId || '',
          email: entry.email || '',
          name: entry.name || 'Anonymous',
          role: entry.role || 'USER',
          score: entry.score || 0,
          answersCount: entry.answersCount || 0,
          correctAnswersCount: entry.correctAnswersCount || 0,
          snapshotAt,
        },
        update: {
          collegeId: entry.collegeId || '',
          email: entry.email || '',
          name: entry.name || 'Anonymous',
          role: entry.role || 'USER',
          score: entry.score || 0,
          answersCount: entry.answersCount || 0,
          correctAnswersCount: entry.correctAnswersCount || 0,
          snapshotAt,
        },
      }),
    ),
  );

  const topFive = await prisma.leaderboardScore.findMany({
    orderBy: [{ score: 'desc' }, { name: 'asc' }],
    take: 5,
    select: {
      name: true,
      collegeId: true,
      score: true,
      answersCount: true,
      correctAnswersCount: true,
    },
  });

  console.log(
    JSON.stringify(
      {
        restoredFrom: snapshotPath,
        restoredEntries: leaderboard.length,
        topFive,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
