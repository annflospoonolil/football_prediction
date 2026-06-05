import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchLockService {
  constructor(private prisma: PrismaService) {}

  @Cron('* * * * *') // runs every 1 minute
  async lockMatches() {
    const now = new Date();

    await this.prisma.match.updateMany({
      where: {
        kickoffAt: { lte: now },
        isLocked: false,
      },
      data: {
        isLocked: true,
      },
    });

    console.log('Checked and locked expired matches');
  }
}
