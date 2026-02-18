import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { GithubModule } from './github/github.module';
import { BullModule } from '@nestjs/bullmq';
import { PullRequestProcessor } from './github/processors/pull-request.processor';
import { GithubService } from './github/github.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    AuthModule,
    UsersModule,
    GithubModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, PullRequestProcessor, GithubService],
})
export class AppModule {
  constructor() {}
}
