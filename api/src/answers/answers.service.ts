import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { BadRequestException } from '@nestjs/common';

// types/answer.types.ts

export type GoalScorers = {
  teamA: string[];
  teamB: string[];
};

export type Score = {
  teamA: number;
  teamB: number;
};

export type SelectedOptions = {
  score?: Score;
  goalScorers?: GoalScorers;
};
@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}
  private validateGoalScorers(score, goalScorers, match) {
    const teamAPlayers = goalScorers?.teamA ?? [];
    const teamBPlayers = goalScorers?.teamB ?? [];

    if (teamAPlayers.length !== score.teamA) {
      throw new BadRequestException(
        `You must select ${score.teamA} scorers for ${match.teamA}`,
      );
    }

    if (teamBPlayers.length !== score.teamB) {
      throw new BadRequestException(
        `You must select ${score.teamB} scorers for ${match.teamB}`,
      );
    }
  }
  async getUserAnswers(userId: string, matchId: string) {
    return this.prisma.answer.findMany({
      where: {
        userId,
        question: {
          matchId,
        },
      },
      include: {
        question: true,
      },
    });
  }

  async submitAnswer(userId: string, dto: CreateAnswerDto) {
    const question = await this.prisma.question.findUnique({
      where: { id: dto.questionId },
      include: { match: true },
    });

    if (!question) {
      throw new BadRequestException('Question not found');
    }

    const matchStarted = new Date() >= new Date(question.match.kickoffAt);

    if (matchStarted) {
      throw new ForbiddenException(
        'Match already started. Predictions are closed.',
      );
    }

    const selectedOptions = (dto.selectedOptions ?? {}) as SelectedOptions;
    const score = selectedOptions.score ?? { teamA: 0, teamB: 0 };
    const goalScorers = selectedOptions.goalScorers ?? {};

    // ⚽ VALIDATION ONLY FOR GOAL SCORERS QUESTION
    if (question.template === 'GOAL_SCORERS') {
      this.validateGoalScorers(score, goalScorers, question.match);
    }

    return this.prisma.answer.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId: dto.questionId,
        },
      },
      create: {
        userId,
        questionId: dto.questionId,
        optionId: dto.optionId ?? null,
        textAnswer: dto.textAnswer ?? null,
        selectedOptions: dto.selectedOptions ?? {},
      },
      update: {
        optionId: dto.optionId ?? null,
        textAnswer: dto.textAnswer ?? null,
        selectedOptions: dto.selectedOptions ?? {},
      },
    });
  }
  async getLeaderboard() {
    const answers = await this.prisma.answer.findMany({
      include: {
        question: {
          include: {
            options: true,
          },
        },
        option: true,
        user: true,
      },
    });
    const scoreMap = {};

    for (const ans of answers) {
      const userId = ans.userId;

      if (!scoreMap[userId]) {
        scoreMap[userId] = {
          userId,
          name: ans.user.fullName,
          score: 0,
        };
      }

      if (
        ans.question.type === 'OPTION' &&
        ans.optionId &&
        ans.option?.isCorrect
      ) {
        scoreMap[userId].score += 1;
      }

      // TEXT
      if (
        ans.question.type === 'TEXT' &&
        ans.textAnswer &&
        ans.question.correctTextAnswer &&
        ans.textAnswer.trim().toLowerCase() ===
          ans.question.correctTextAnswer.trim().toLowerCase()
      ) {
        scoreMap[userId].score += 1;
      }
      if (
        ans.question.type === 'SCORE' &&
        ans.textAnswer?.trim().toLowerCase() ===
          ans.question.correctTextAnswer?.trim().toLowerCase()
      ) {
        scoreMap[userId].score += 3;
      }

      // MULTI_SELECT
      const selectedOptions = Array.isArray(ans.selectedOptions)
        ? (ans.selectedOptions as string[])
        : [];
      if (ans.question.type === 'MULTI_SELECT' && selectedOptions?.length) {
        const correctOptions = ans.question.options
          .filter((o) => o.isCorrect)
          .map((o) => o.id);

        const matched = selectedOptions.filter((id) =>
          correctOptions.includes(id),
        ).length;

        // Partial scoring
        scoreMap[userId].score += matched;
      }
    }

    return Object.values(scoreMap).sort((a: any, b: any) => b.score - a.score);
  }
}
