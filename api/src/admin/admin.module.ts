import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionsModule } from '../questions/questions.module';
@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
  imports: [QuestionsModule],
})
export class AdminModule {}
