import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OptionsService } from './options.service';
import { CreateOptionDto } from './dto/create-option.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('options')
export class OptionsController {
  constructor(private optionsService: OptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateOptionDto) {
    return this.optionsService.createOption(dto);
  }
  @Patch(':id/correct')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  setCorrect(@Param('id') id: string) {
    return this.optionsService.setCorrect(id);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.optionsService.remove(id);
  }
  @Patch(':id/toggle-correct')
  toggleCorrect(@Param('id') id: string) {
    return this.optionsService.toggleCorrect(id);
  }
}
