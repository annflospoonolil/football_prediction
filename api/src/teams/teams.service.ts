import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async getAllTeams() {
    return this.prisma.team.findMany({
      include: {
        players: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getTeam(id: string) {
    return this.prisma.team.findUnique({
      where: { id },
      include: {
        players: true,
      },
    });
  }
}
