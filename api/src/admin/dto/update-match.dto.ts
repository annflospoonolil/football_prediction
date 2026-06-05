import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateMatchDto {
  @IsOptional()
  @IsString()
  teamAId?: string;

  @IsOptional()
  @IsString()
  teamBId?: string;

  @IsOptional()
  @IsDateString()
  kickoffAt?: string;
}
