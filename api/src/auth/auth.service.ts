import { Injectable, ConflictException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { collegeId: dto.identifier }],
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
    });

    return {
      message: 'Login successful',
      access_token: token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        collegeId: user.collegeId,
      },
    };
  }
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { collegeId: dto.collegeId }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or College ID already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        collegeId: dto.collegeId,
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
      },
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        collegeId: user.collegeId,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
    };
  }
}
