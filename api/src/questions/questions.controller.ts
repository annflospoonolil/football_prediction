import { Body, Controller, Delete, Patch, Post } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Param, Get } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateQuestionDto) {
    return this.questionsService.createQuestion(dto);
  }
  @Get(':id/results')
  getResults(@Param('id') id: string) {
    return this.questionsService.getResults(id);
  }
  @Get()
  getAllQuestions() {
    return this.questionsService.getAllQuestions();
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @Patch(':id/correct-text')
  setCorrectText(@Param('id') id: string, @Body() body: { answer: string }) {
    return this.questionsService.setCorrectText(id, body.answer);
  }
}
