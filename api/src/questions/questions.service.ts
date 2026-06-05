import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QUESTION_TEMPLATES } from './templates/question.templates';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async generateForMatch(matchId: string, teamA: any, teamB: any) {
    const createdQuestions: any[] = [];

    for (const [key, t] of Object.entries(QUESTION_TEMPLATES)) {
      // 1. create question
      const question = await this.prisma.question.create({
        data: {
          matchId,
          text: t.text,
          type: t.type,
          template: key,
        },
      });

      createdQuestions.push(question);

      // 2. generate options (THIS IS WHAT YOU MISSED)
      const options = (t as any).generateOptions?.({
        id: matchId,
        teamA,
        teamB,
      });

      // 3. save options
      if (options?.length) {
        await this.prisma.option.createMany({
          data: options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect || false,
            questionId: question.id,
          })),
        });
      }
    }

    return createdQuestions;
  }
  async createQuestion(dto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: {
        text: dto.text,
        matchId: dto.matchId,
        type: dto.type,
        template: dto.template,
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
  getAllQuestions() {
    return this.prisma.question.findMany({
      include: {
        match: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async remove(id: string) {
    await this.prisma.option.deleteMany({
      where: {
        questionId: id,
      },
    });

    await this.prisma.answer.deleteMany({
      where: {
        questionId: id,
      },
    });

    return this.prisma.question.delete({
      where: {
        id,
      },
    });
  }
  async setCorrectText(questionId: string, answer: string) {
    return this.prisma.question.update({
      where: { id: questionId },
      data: {
        correctTextAnswer: answer,
      },
    });
  }
}
