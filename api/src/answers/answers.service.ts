import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { BadRequestException } from '@nestjs/common';

// types/answer.types.ts
@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}
  async getUserAnswers(userId: string, matchId: string) {
    return this.prisma.answer.findMany({
      where: {
        userId: userId,
        question: {
          matchId: matchId, // 🚀 Filter by the match!
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
    if (question.match.isLocked || matchStarted) {
      throw new ForbiddenException(
        'Match already started. Predictions are closed.',
      );
    }
    const updateData: any = {};

    if (dto.optionId !== undefined) {
      updateData.optionId = dto.optionId;
    }
    if (dto.textAnswer !== undefined) {
      updateData.textAnswer = dto.textAnswer;
    }
    if (
      dto.selectedOptions !== undefined &&
      Array.isArray(dto.selectedOptions)
    ) {
      updateData.selectedOptions = dto.selectedOptions;
    }
    const createData = {
      userId,
      questionId: dto.questionId,
      optionId: dto.optionId ?? null,
      textAnswer: dto.textAnswer ?? null,
      selectedOptions: Array.isArray(dto.selectedOptions)
        ? dto.selectedOptions
        : [],
    };
    if (dto.optionId) {
      const option = await this.prisma.option.findUnique({
        where: { id: dto.optionId },
      });

      if (!option) {
        throw new BadRequestException('Option not found');
      }

      if (option.questionId !== dto.questionId) {
        throw new BadRequestException(
          'Option does not belong to this question',
        );
      }
    }
    if (
      dto.selectedOptions &&
      Array.isArray(dto.selectedOptions) &&
      dto.selectedOptions.length > 0
    ) {
      const options = await this.prisma.option.findMany({
        where: {
          id: {
            in: dto.selectedOptions,
          },
        },
      });
      const invalid = options.some((o) => o.questionId !== dto.questionId);

      if (invalid) {
        throw new BadRequestException(
          'Selected option does not belong to this question',
        );
      }
    }
    return this.prisma.answer.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId: dto.questionId,
        },
      },
      create: createData,
      update: updateData,
    });
  }

  private leaderboardCache: any = null;
  private cacheTime = 0;
  async getLeaderboard() {
    // This is the array data you just shared!
    const answers = await this.prisma.answer.findMany({
      include: {
        question: {
          include: { options: true }, // Populates the options arrays
        },
        user: true, // Populates the user details (fullName, email, etc.)
      },
    });

    const userScores: Record<string, { name: string; score: number }> = {};

    answers.forEach((ans) => {
      const userId = ans.userId;

      // Initialize user tracker if it doesn't exist yet
      if (!userScores[userId]) {
        userScores[userId] = {
          name: ans.user?.fullName || 'Anonymous',
          score: 0,
        };
      }

      // ─── TYPE 1: SCORE PREDICTIONS (Exact String Matching) ───
      if (ans.question.type === 'SCORE') {
        if (
          ans.textAnswer &&
          ans.question.correctTextAnswer &&
          ans.textAnswer.trim() === ans.question.correctTextAnswer.trim()
        ) {
          userScores[userId].score += 1; // Award 15 points for exact final score
        }
      }

      // ─── TYPE 2: MULTI_SELECT PREDICTIONS (Goalscorers Array Math) ───
      else if (
        ans.question.type === 'MULTI_SELECT' &&
        Array.isArray(ans.selectedOptions)
      ) {
        const uniqueSelections = [...new Set(ans.selectedOptions)];

        const adminCorrectOptions = ans.question.options
          .filter((o) => o.isCorrect)
          .map((o) => o.id);

        uniqueSelections.forEach((optionId) => {
          const optionInDb = ans.question.options.find(
            (o) => o.id === optionId,
          );

          if (optionInDb && optionInDb.isCorrect) {
            userScores[userId].score += 1;
          }
        });
      }

      // ─── TYPE 3: SINGLE OPTION PREDICTIONS (MOTM, Possession, etc.) ───
      else if (ans.question.type === 'OPTION' && ans.optionId) {
        const selectedOption = ans.question.options.find(
          (o) => o.id === ans.optionId,
        );
        if (selectedOption && selectedOption.isCorrect) {
          userScores[userId].score += 1;
          // Award 10 points for correct option pick
        }
      }
    });

    // Convert map tracker object back into a sorted array for your React component
    const sortedLeaderboard = Object.keys(userScores)
      .map((id) => ({
        userId: id,
        name: userScores[id].name,
        score: userScores[id].score,
      }))
      .sort((a, b) => b.score - a.score);

    return sortedLeaderboard;
  }
}
