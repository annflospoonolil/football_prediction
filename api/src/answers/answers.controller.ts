import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';

import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('answers')
export class AnswersController {
  constructor(private answersService: AnswersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  submit(@Request() req: any, @Body() dto: CreateAnswerDto) {
    return this.answersService.submitAnswer(req.user.userId, dto);
  }
}
