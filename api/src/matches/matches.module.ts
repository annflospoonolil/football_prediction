import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { QuestionsModule } from '../questions/questions.module';
import { MatchLockService } from './match-lock.service';

@Module({
  providers: [MatchesService, MatchLockService],
  controllers: [MatchesController],
  imports: [QuestionsModule],
})
export class MatchesModule {}
