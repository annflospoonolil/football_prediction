import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async createQuestion(dto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: {
        text: dto.text,
        matchId: dto.matchId,
        type: dto.type,
      },
    });
  }
  async getResults(questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: true,
      },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    const grouped = await this.prisma.answer.groupBy({
      by: ['optionId'],
      where: {
        questionId,
      },
      _count: {
        optionId: true,
      },
    });

    const results = question.options.map((option) => {
      const match = grouped.find((g) => g.optionId === option.id);

      return {
        option: option.text,
        votes: match?._count.optionId || 0,
      };
    });

    return {
      question: question.text,
      results,
    };
  }
}
