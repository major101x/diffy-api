import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaService } from 'src/prisma.service';
import { EventsGateway } from 'src/events/events.gateway';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, PrismaService, EventsGateway],
})
export class CommentsModule {}
