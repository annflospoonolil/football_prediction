import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MatchesModule } from './matches/matches.module';
import { QuestionsModule } from './questions/questions.module';
import { OptionsModule } from './options/options.module';
import { AnswersModule } from './answers/answers.module';

@Module({
  imports: [AuthModule, PrismaModule, MatchesModule, QuestionsModule, OptionsModule, AnswersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
