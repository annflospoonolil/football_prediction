import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ScoreResult = {
  points: number;
  correct: boolean;
};

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard() {
    const persistedScores = await this.prisma.leaderboardScore.findMany({
      orderBy: [{ score: 'desc' }, { name: 'asc' }],
      select: {
        userId: true,
        name: true,
        score: true,
      },
    });

    if (persistedScores.length > 0) {
      return persistedScores;
    }

    return this.calculateLeaderboardFromAnswers();
  }

  async refreshMatchScores(matchId: string) {
    const snapshotAt = new Date();
    const answers = await this.prisma.answer.findMany({
      where: {
        question: {
          matchId,
        },
      },
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
            options: true,
            match: {
              include: {
                teamA: true,
                teamB: true,
              },
            },
          },
        },
      },
    });

    const existingMatchScores = await this.prisma.leaderboardMatchScore.findMany({
      where: { matchId },
    });
    const currentByUserId = new Map<string, any>();

    for (const answer of answers) {
      const userId = answer.userId;
      const score = this.scoreAnswer(answer).points;
      const existing = currentByUserId.get(userId) ?? {
        userId,
        collegeId: answer.user?.collegeId || '',
        email: answer.user?.email || '',
        name: answer.user?.fullName || 'Anonymous',
        role: answer.user?.role || 'USER',
        score: 0,
      };

      existing.score += score;
      currentByUserId.set(userId, existing);
    }

    const userIds = new Set<string>([
      ...existingMatchScores.map((entry) => entry.userId),
      ...currentByUserId.keys(),
    ]);

    const matchName =
      answers[0]?.question?.match
        ? `${answers[0].question.match.teamA.name} vs ${answers[0].question.match.teamB.name}`
        : 'Deleted match';

    await this.prisma.$transaction(
      [...userIds].flatMap((userId) => {
        const current = currentByUserId.get(userId);
        const previousScore =
          existingMatchScores.find((entry) => entry.userId === userId)?.score ?? 0;
        const nextScore = current?.score ?? 0;
        const delta = nextScore - previousScore;

        const operations: any[] = [];

        if (current) {
          operations.push(
            this.prisma.leaderboardMatchScore.upsert({
              where: {
                userId_matchId: {
                  userId,
                  matchId,
                },
              },
              create: {
                userId,
                matchId,
                matchName,
                score: nextScore,
                snapshotAt,
              },
              update: {
                matchName,
                score: nextScore,
                snapshotAt,
              },
            }),
          );

          operations.push(
            this.prisma.leaderboardScore.upsert({
              where: { userId },
              create: {
                userId,
                collegeId: current.collegeId,
                email: current.email,
                name: current.name,
                role: current.role,
                score: nextScore,
                answersCount: 0,
                correctAnswersCount: 0,
                snapshotAt,
              },
              update: {
                collegeId: current.collegeId,
                email: current.email,
                name: current.name,
                role: current.role,
                score: {
                  increment: delta,
                },
                snapshotAt,
              },
            }),
          );
        } else if (delta !== 0) {
          operations.push(
            this.prisma.leaderboardMatchScore.update({
              where: {
                userId_matchId: {
                  userId,
                  matchId,
                },
              },
              data: {
                score: 0,
                snapshotAt,
              },
            }),
          );
          operations.push(
            this.prisma.leaderboardScore.update({
              where: { userId },
              data: {
                score: {
                  increment: delta,
                },
                snapshotAt,
              },
            }),
          );
        }

        return operations;
      }),
    );
  }

  private async calculateLeaderboardFromAnswers() {
    const answers = await this.prisma.answer.findMany({
      include: {
        question: {
          include: { options: true },
        },
        user: true,
      },
    });

    const userScores: Record<string, { name: string; score: number }> = {};

    answers.forEach((answer) => {
      if (!userScores[answer.userId]) {
        userScores[answer.userId] = {
          name: answer.user?.fullName || 'Anonymous',
          score: 0,
        };
      }

      userScores[answer.userId].score += this.scoreAnswer(answer).points;
    });

    return Object.keys(userScores)
      .map((id) => ({
        userId: id,
        name: userScores[id].name,
        score: userScores[id].score,
      }))
      .sort((a, b) => b.score - a.score);
  }

  private scoreAnswer(answer: any): ScoreResult {
    const question = answer.question;

    if (question.type === 'SCORE') {
      const isCorrect =
        this.normalizeText(answer.textAnswer) !== '' &&
        this.normalizeText(question.correctTextAnswer) !== '' &&
        this.normalizeText(answer.textAnswer) ===
          this.normalizeText(question.correctTextAnswer);

      return {
        points: isCorrect ? 1 : 0,
        correct: isCorrect,
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
      };
    }

    if (question.type === 'OPTION' && answer.optionId) {
      const selectedOption = question.options.find(
        (option) => option.id === answer.optionId,
      );
      const isCorrect = Boolean(selectedOption?.isCorrect);

      return {
        points: isCorrect ? 1 : 0,
        correct: isCorrect,
      };
    }

    return {
      points: 0,
      correct: false,
    };
  }

  private normalizeText(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
  }
}
