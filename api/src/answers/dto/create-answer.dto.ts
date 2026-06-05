import { IsString, IsUUID, IsOptional, IsArray } from 'class-validator';

export class CreateAnswerDto {
  @IsUUID()
  questionId!: string;

  @IsOptional()
  @IsUUID()
  optionId?: string;

  @IsOptional()
  @IsString()
  textAnswer?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  selectedOptions?: string[];
}
