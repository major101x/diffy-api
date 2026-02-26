import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaService } from 'src/prisma.service';
import { EventsModule } from 'src/events/events.module';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, PrismaService],
  imports: [EventsModule],
})
export class CommentsModule {}
