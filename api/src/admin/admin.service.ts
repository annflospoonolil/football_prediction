import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { QuestionsService } from '../questions/questions.service';

@Injectable()
export class AdminService {
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
    const fullMatch = await this.prisma.match.findUnique({
      where: { id: match.id },
      include: {
        teamA: { include: { players: true } },
        teamB: { include: { players: true } },
      },
    });
    if (!fullMatch) throw new Error('Match not found');

    await this.questionsService.generateForMatch(
      fullMatch.id,
      fullMatch.teamA,
      fullMatch.teamB,
    );

    return match;
  }
  async updateMatch(matchId: string, data: UpdateMatchDto) {
    return this.prisma.match.update({
      where: { id: matchId },
      data: {
        ...data,
        kickoffAt: data.kickoffAt ? new Date(data.kickoffAt) : undefined,
      },
    });
  }

  async lockMatch(matchId: string) {
    return this.prisma.match.update({
      where: { id: matchId },
      data: { isLocked: true },
    });
  }

  unlockMatch(matchId: string) {
    return this.prisma.match.update({
      where: { id: matchId },
      data: { isLocked: false },
    });
  }

  async getAllMatches() {
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
  completeMatch(matchId: string) {
    return this.prisma.match.update({
      where: { id: matchId },
      data: { isCompleted: true, isLocked: true },
    });
  }
  async deleteMatch(matchId: string) {
    return this.prisma.match.delete({
      where: { id: matchId },
    });
  }
}
