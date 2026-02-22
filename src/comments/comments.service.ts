import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma.service';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: number) {
    const comment = await this.prisma.comment.create({
      data: {
        ...createCommentDto,
        userId,
      },
    });

    this.eventsGateway.server
      .to(`pr:${createCommentDto.pullRequestId}`)
      .emit('newComment', comment);

    return comment;
  }

  findAll(prId: number) {
    return this.prisma.comment.findMany({
      where: {
        pullRequestId: prId,
      },
      include: {
        user: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.comment.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return this.prisma.comment.update({
      where: {
        id,
      },
      data: updateCommentDto,
    });
  }

  remove(id: number) {
    return this.prisma.comment.delete({
      where: {
        id,
      },
    });
  }
}
