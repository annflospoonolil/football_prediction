import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { QuestionsService } from '../questions/questions.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { parseKickoffAt } from '../utils/kickoff-time';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private questionsService: QuestionsService,
    private leaderboardService: LeaderboardService,
  ) {}

  async createMatch(dto: CreateMatchDto) {
    const match = await this.prisma.match.create({
      data: {
        teamAId: dto.teamAId,
        teamBId: dto.teamBId,
        kickoffAt: parseKickoffAt(dto.kickoffAt),
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
        kickoffAt: data.kickoffAt ? parseKickoffAt(data.kickoffAt) : undefined,
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
  async completeMatch(matchId: string) {
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: { isCompleted: true, isLocked: true },
    });

    await this.leaderboardService.refreshMatchScores(matchId);

    return match;
  }
  async deleteMatch(matchId: string) {
    return this.prisma.match.delete({
      where: { id: matchId },
    });
  }
}
