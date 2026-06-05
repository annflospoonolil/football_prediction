import { IsEmail, IsString, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  collegeId!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  role?: string;
}
