import { Module } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
@Module({
  imports: [LeaderboardModule],
  providers: [AnswersService, PrismaService],
  controllers: [AnswersController],
})
export class AnswersModule {}
