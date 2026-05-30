import { Module } from '@nestjs/common';
import { OptionsService } from './options.service';
import { OptionsController } from './options.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [OptionsService, PrismaService],
  controllers: [OptionsController],
})
export class OptionsModule {}
