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
}
