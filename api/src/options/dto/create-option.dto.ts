import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOptionDto {
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsOptional()
  teamSide?: string;
}
