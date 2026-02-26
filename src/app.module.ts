import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { GithubModule } from './github/github.module';
import { BullModule } from '@nestjs/bullmq';
import { EventsModule } from './events/events.module';
import { CommentsModule } from './comments/comments.module';

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
    EventsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {
  constructor() {}
}
