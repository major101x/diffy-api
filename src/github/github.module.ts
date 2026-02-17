import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { UsersModule } from 'src/users/users.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [UsersModule],
  controllers: [GithubController],
  providers: [GithubService, PrismaService],
})
export class GithubModule {}
