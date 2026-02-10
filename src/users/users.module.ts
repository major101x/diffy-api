import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, JwtAuthGuard],
  exports: [UsersService],
})
export class UsersModule {}
