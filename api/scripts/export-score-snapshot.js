const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function toCsv(rows, columns) {
  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(',')),
  ].join('\n');
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function scoreAnswer(answer) {
  const question = answer.question;

  if (question.type === 'SCORE') {
    const isCorrect =
      normalizeText(answer.textAnswer) !== '' &&
      normalizeText(question.correctTextAnswer) !== '' &&
      normalizeText(answer.textAnswer) === normalizeText(question.correctTextAnswer);

    return {
      points: isCorrect ? 1 : 0,
      correct: isCorrect,
      selected: answer.textAnswer,
      correctAnswer: question.correctTextAnswer,
    };
  }

  if (question.type === 'MULTI_SELECT' && Array.isArray(answer.selectedOptions)) {
    const uniqueSelections = [...new Set(answer.selectedOptions)];
    const correctOptionIds = question.options
      .filter((option) => option.isCorrect)
      .map((option) => option.id);
    const selectedCorrectOptionIds = uniqueSelections.filter((optionId) =>
      correctOptionIds.includes(optionId),
    );

    return {
      points: selectedCorrectOptionIds.length,
      correct: selectedCorrectOptionIds.length > 0,
      selected: uniqueSelections
        .map((optionId) => question.options.find((option) => option.id === optionId)?.text || optionId)
        .join('; '),
      correctAnswer: question.options
        .filter((option) => option.isCorrect)
        .map((option) => option.text)
        .join('; '),
    };
  }

  if (question.type === 'OPTION' && answer.optionId) {
    const selectedOption = question.options.find((option) => option.id === answer.optionId);
    const correctOptions = question.options.filter((option) => option.isCorrect);
    const isCorrect = Boolean(selectedOption?.isCorrect);

    return {
      points: isCorrect ? 1 : 0,
      correct: isCorrect,
      selected: selectedOption?.text || answer.optionId,
      correctAnswer: correctOptions.map((option) => option.text).join('; '),
    };
  }

  return {
    points: 0,
    correct: false,
    selected: answer.textAnswer || answer.optionId || JSON.stringify(answer.selectedOptions || []),
    correctAnswer: '',
  };
}

async function main() {
  const exportedAt = new Date();
  const outputDir = path.join(__dirname, '..', 'backups', 'score-snapshots');
  fs.mkdirSync(outputDir, { recursive: true });

  const [users, answers, matches] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        collegeId: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.answer.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            collegeId: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
        question: {
          include: {
            options: {
              orderBy: { createdAt: 'asc' },
            },
            match: {
              include: {
                teamA: true,
                teamB: true,
              },
            },
          },
        },
      },
    }),
    prisma.match.findMany({
      orderBy: { kickoffAt: 'asc' },
      include: {
        teamA: true,
        teamB: true,
        questions: {
          include: {
            options: {
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
  ]);

  const scoreByUserId = new Map(
    users.map((user) => [
      user.id,
      {
        userId: user.id,
        collegeId: user.collegeId,
        email: user.email,
        name: user.fullName,
        role: user.role,
        score: 0,
        answersCount: 0,
        correctAnswersCount: 0,
      },
    ]),
  );

  const matchScoresByKey = new Map();

  const answerDetails = answers.map((answer) => {
    const result = scoreAnswer(answer);
    const userScore = scoreByUserId.get(answer.userId);
    const matchName = `${answer.question.match.teamA.name} vs ${answer.question.match.teamB.name}`;

    if (userScore) {
      userScore.score += result.points;
      userScore.answersCount += 1;
      if (result.points > 0) userScore.correctAnswersCount += 1;
    }

    const matchScoreKey = `${answer.userId}:${answer.question.matchId}`;
    const matchScore = matchScoresByKey.get(matchScoreKey) || {
      userId: answer.userId,
      matchId: answer.question.matchId,
      matchName,
      score: 0,
    };
    matchScore.score += result.points;
    matchScoresByKey.set(matchScoreKey, matchScore);

    return {
      answerId: answer.id,
      userId: answer.userId,
      collegeId: answer.user?.collegeId || '',
      email: answer.user?.email || '',
      name: answer.user?.fullName || 'Anonymous',
      matchId: answer.question.matchId,
      match: matchName,
      kickoffAt: answer.question.match.kickoffAt,
      matchCompleted: answer.question.match.isCompleted,
      questionId: answer.questionId,
      questionType: answer.question.type,
      questionText: answer.question.text,
      selected: result.selected,
      correctAnswer: result.correctAnswer,
      points: result.points,
      correct: result.correct,
      answeredAt: answer.createdAt,
    };
  });

  const leaderboard = [...scoreByUserId.values()]
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .map((entry, index) => ({ rank: index + 1, ...entry }));

  await prisma.$transaction([
    ...leaderboard.map((entry) =>
      prisma.leaderboardScore.upsert({
        where: { userId: entry.userId },
        create: {
          userId: entry.userId,
          collegeId: entry.collegeId,
          email: entry.email,
          name: entry.name,
          role: entry.role,
          score: entry.score,
          answersCount: entry.answersCount,
          correctAnswersCount: entry.correctAnswersCount,
          snapshotAt: exportedAt,
        },
        update: {
          collegeId: entry.collegeId,
          email: entry.email,
          name: entry.name,
          role: entry.role,
          score: entry.score,
          answersCount: entry.answersCount,
          correctAnswersCount: entry.correctAnswersCount,
          snapshotAt: exportedAt,
        },
      }),
    ),
    ...[...matchScoresByKey.values()].map((entry) =>
      prisma.leaderboardMatchScore.upsert({
        where: {
          userId_matchId: {
            userId: entry.userId,
            matchId: entry.matchId,
          },
        },
        create: {
          userId: entry.userId,
          matchId: entry.matchId,
          matchName: entry.matchName,
          score: entry.score,
          snapshotAt: exportedAt,
        },
        update: {
          matchName: entry.matchName,
          score: entry.score,
          snapshotAt: exportedAt,
        },
      }),
    ),
  ]);

  const summary = {
    exportedAt: exportedAt.toISOString(),
    databaseUrlHost: process.env.DATABASE_URL
      ? new URL(process.env.DATABASE_URL).host
      : 'DATABASE_URL not set',
    totals: {
      users: users.length,
      answers: answers.length,
      matches: matches.length,
      completedMatches: matches.filter((match) => match.isCompleted).length,
      lockedMatches: matches.filter((match) => match.isLocked).length,
    },
    scoringRule:
      'Matches current AnswersService: +1 exact SCORE, +1 correct OPTION, +1 for each selected correct MULTI_SELECT option.',
  };

  const snapshot = {
    summary,
    leaderboard,
    answerDetails,
    matches,
  };

  const stamp = exportedAt.toISOString().replaceAll(':', '-').replaceAll('.', '-');
  const jsonPath = path.join(outputDir, `score-snapshot-${stamp}.json`);
  const leaderboardCsvPath = path.join(outputDir, `leaderboard-${stamp}.csv`);
  const answersCsvPath = path.join(outputDir, `answer-details-${stamp}.csv`);

  fs.writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2));
  fs.writeFileSync(
    leaderboardCsvPath,
    toCsv(leaderboard, [
      'rank',
      'userId',
      'collegeId',
      'email',
      'name',
      'role',
      'score',
      'answersCount',
      'correctAnswersCount',
    ]),
  );
  fs.writeFileSync(
    answersCsvPath,
    toCsv(answerDetails, [
      'answerId',
      'userId',
      'collegeId',
      'email',
      'name',
      'matchId',
      'match',
      'kickoffAt',
      'matchCompleted',
      'questionId',
      'questionType',
      'questionText',
      'selected',
      'correctAnswer',
      'points',
      'correct',
      'answeredAt',
    ]),
  );

  console.log(JSON.stringify({ summary, files: { jsonPath, leaderboardCsvPath, answersCsvPath } }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
