import { Module } from '@nestjs/common';
import { OptionsService } from './options.service';
import { OptionsController } from './options.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';

@Module({
  imports: [LeaderboardModule],
  providers: [OptionsService, PrismaService],
  controllers: [OptionsController],
})
export class OptionsModule {}
