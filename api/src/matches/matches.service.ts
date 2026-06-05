import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { QuestionsService } from '../questions/questions.service';

@Injectable()
export class MatchesService {
  constructor(
    private prisma: PrismaService,
    private questionsService: QuestionsService,
  ) {}

  async createMatch(dto: CreateMatchDto) {
    const match = await this.prisma.match.create({
      data: {
        teamAId: dto.teamAId,
        teamBId: dto.teamBId,
        kickoffAt: new Date(dto.kickoffAt),
      },
    });

    const teamA = await this.prisma.team.findUnique({
      where: { id: dto.teamAId },
    });

    const teamB = await this.prisma.team.findUnique({
      where: { id: dto.teamBId },
    });

    await this.questionsService.generateForMatch(
      match.id,
      { name: teamA?.name || 'Team A' },
      { name: teamB?.name || 'Team B' },
    );

    return match;
  }

  async getMatches() {
    return this.prisma.match.findMany({
      include: {
        teamA: true,
        teamB: true,
      },
      orderBy: {
        kickoffAt: 'asc',
      },
    });
  }

  async getMatchById(id: string) {
    const match = await this.prisma.match.findUnique({
      where: {
        id,
      },
      include: {
        teamA: {
          include: {
            players: true,
          },
        },
        teamB: {
          include: {
            players: true,
          },
        },
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!match) {
      throw new BadRequestException('Match not found');
    }

    return match;
  }

  findAll() {
    return this.prisma.match.findMany({
      include: {
        teamA: true,
        teamB: true,
      },
      orderBy: {
        kickoffAt: 'asc',
      },
    });
  }

  getAllMatches() {
    return this.prisma.match.findMany({
      include: {
        teamA: true,
        teamB: true,
      },
      orderBy: {
        kickoffAt: 'asc',
      },
    });
  }
}
