import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionsModule } from '../questions/questions.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, RolesGuard],
  imports: [QuestionsModule, LeaderboardModule],
})
export class AdminModule {}
