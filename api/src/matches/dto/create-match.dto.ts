import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  teamAId!: string;

  @IsString()
  @IsNotEmpty()
  teamBId!: string;

  @IsString()
  @IsNotEmpty()
  kickoffAt!: string;
}
