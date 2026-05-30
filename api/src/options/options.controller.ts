import { Body, Controller, Post } from '@nestjs/common';
import { OptionsService } from './options.service';
import { CreateOptionDto } from './dto/create-option.dto';

@Controller('options')
export class OptionsController {
  constructor(private optionsService: OptionsService) {}

  @Post()
  create(@Body() dto: CreateOptionDto) {
    return this.optionsService.createOption(dto);
  }
}
