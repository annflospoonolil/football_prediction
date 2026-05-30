import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';

@Controller('matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Post()
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.createMatch(dto);
  }

  // 🔥 ADD THIS
  @Get()
  getAllMatches() {
    return this.matchesService.getAllMatches();
  }

  @Get(':id')
  getMatch(@Param('id') id: string) {
    return this.matchesService.getMatchById(id);
  }
}
