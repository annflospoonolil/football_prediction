import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOptionDto } from './dto/create-option.dto';

@Injectable()
export class OptionsService {
  constructor(private prisma: PrismaService) {}

  async createOption(dto: CreateOptionDto) {
    return this.prisma.option.create({
      data: {
        text: dto.text,
        questionId: dto.questionId,
      },
    });
  }
  async setCorrect(optionId: string) {
    const option = await this.prisma.option.findUnique({
      where: { id: optionId },
    });

    if (!option) {
      throw new Error('Option not found');
    }

    await this.prisma.option.updateMany({
      where: {
        questionId: option.questionId,
      },
      data: {
        isCorrect: false,
      },
    });

    return this.prisma.option.update({
      where: {
        id: optionId,
      },
      data: {
        isCorrect: true,
      },
    });
  }
  async toggleCorrect(optionId: string) {
    const option = await this.prisma.option.findUnique({
      where: { id: optionId },
    });

    if (!option) {
      throw new Error('Option not found');
    }

    return this.prisma.option.update({
      where: {
        id: optionId,
      },
      data: {
        isCorrect: !option.isCorrect,
      },
    });
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
