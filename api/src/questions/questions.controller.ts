import { Body, Controller, Post } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Param, Get } from '@nestjs/common';
@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Post()
  create(@Body() dto: CreateQuestionDto) {
    return this.questionsService.createQuestion(dto);
  }
  @Get(':id/results')
  getResults(@Param('id') id: string) {
    return this.questionsService.getResults(id);
  }
}
