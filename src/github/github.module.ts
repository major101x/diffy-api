import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { UsersModule } from 'src/users/users.module';
import { PrismaService } from '../prisma.service';
import { BullModule } from '@nestjs/bullmq';
import { PullRequestProcessor } from './processors/pull-request.processor';

@Module({
  imports: [
    UsersModule,
    BullModule.registerQueue({
      name: 'webhook-queue',
    }),
  ],
  controllers: [GithubController],
  providers: [GithubService, PrismaService, PullRequestProcessor],
})
export class GithubModule {}
