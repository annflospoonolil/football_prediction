import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async createMatch(dto: CreateMatchDto) {
    return this.prisma.match.create({
      data: {
        teamA: dto.teamA,
        teamB: dto.teamB,
        kickoffAt: new Date(dto.kickoffAt),
      },
    });
  }

  async getMatches() {
    return this.prisma.match.findMany({
      orderBy: {
        kickoffAt: 'asc',
      },
    });
  }
  async getMatchById(id: string) {
    return this.prisma.match.findUnique({
      where: {
        id,
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
  }
  findAll() {
    return this.prisma.match.findMany({
      include: {
        questions: true, // optional for home
      },
    });
  }
  getAllMatches() {
    return this.prisma.match.findMany();
  }
}
