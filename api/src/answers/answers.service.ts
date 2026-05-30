import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';

@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}

  async submitAnswer(userId: string, dto: CreateAnswerDto) {
    const existingAnswer = await this.prisma.answer.findFirst({
      where: {
        userId,
        questionId: dto.questionId,
      },
    });

    if (existingAnswer) {
      throw new Error('You already answered this question');
    }

    const question = await this.prisma.question.findUnique({
      where: {
        id: dto.questionId,
      },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    if (question.type === 'OPTION' && !dto.optionId) {
      throw new Error('optionId is required');
    }

    if (question.type === 'TEXT' && !dto.textAnswer) {
      throw new Error('textAnswer is required');
    }

    return this.prisma.answer.create({
      data: {
        userId,
        questionId: dto.questionId,
        optionId: dto.optionId || null,
        textAnswer: dto.textAnswer || null,
      },
    });
  }
}
