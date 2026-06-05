import { IsString, IsDateString } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  teamAId!: string;

  @IsString()
  teamBId!: string;

  @IsDateString()
  kickoffAt!: string;
}
