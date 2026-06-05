import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOptionDto {
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  text!: string;
}
