import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOptionDto } from './dto/create-option.dto';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Injectable()
export class OptionsService {
  constructor(
    private prisma: PrismaService,
    private leaderboardService: LeaderboardService,
  ) {}

  async createOption(dto: CreateOptionDto) {
    return this.prisma.option.create({
      data: {
        text: dto.text,
        questionId: dto.questionId,
        teamId: dto.teamId,
        teamSide: dto.teamSide,
      },
    });
  }
  async setCorrect(optionId: string) {
    const option = await this.prisma.option.findUnique({
      where: { id: optionId },
      include: { question: true },
    });

    if (!option) {
      throw new Error('Option not found');
    }

    if (option.question.type === 'OPTION' || option.question.type === 'SCORE') {
      await this.prisma.option.updateMany({
        where: {
          questionId: option.questionId,
        },
        data: {
          isCorrect: false,
        },
      });
    }

    const updatedOption = await this.prisma.option.update({
      where: { id: optionId },
      data: {
        isCorrect: !option.isCorrect, // 🔄 Toggles true to false, or false to true safely!
      },
    });
    await this.leaderboardService.refreshMatchScores(option.question.matchId);

    return updatedOption;
  }
  async toggleCorrect(optionId: string) {
    const option = await this.prisma.option.findUnique({
      where: { id: optionId },
      include: { question: true },
    });

    if (!option) {
      throw new Error('Option not found');
    }

    const updatedOption = await this.prisma.option.update({
      where: {
        id: optionId,
      },
      data: {
        isCorrect: !option.isCorrect,
      },
    });

    await this.leaderboardService.refreshMatchScores(option.question.matchId);

    return updatedOption;
  }
  async remove(id: string) {
    await this.prisma.answer.deleteMany({
      where: {
        optionId: id,
      },
    });

    return this.prisma.option.delete({
      where: {
        id,
      },
    });
  }
}
