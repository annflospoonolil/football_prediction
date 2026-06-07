import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMatchDto } from './dto/create-match.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('matches')
  createMatch(@Body() dto: CreateMatchDto) {
    return this.adminService.createMatch(dto);
  }

  @Get('matches')
  getMatches() {
    return this.adminService.getAllMatches();
  }

  @Patch('matches/:id')
  updateMatch(@Param('id') id: string, @Body() dto: CreateMatchDto) {
    return this.adminService.updateMatch(id, dto);
  }

  @Patch('matches/:id/lock')
  lockMatch(@Param('id') id: string) {
    return this.adminService.lockMatch(id);
  }

  @Patch('matches/:id/unlock')
  unlockMatch(@Param('id') id: string) {
    return this.adminService.unlockMatch(id);
  }
  @Patch('matches/:id/complete')
  completeMatch(@Param('id') id: string) {
    return this.adminService.completeMatch(id);
  }
  @Delete('matches/:id')
  deleteMatch(@Param('id') id: string) {
    return this.adminService.deleteMatch(id);
  }
}
