import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma.service';
import { EventsGateway } from 'src/events/events.gateway';
import { serializeComments } from 'src/common/utils/serialize-comments';

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
      include: {
        user: true,
      },
    });

    const serializedComment = serializeComments(comment);

    this.eventsGateway.server
      .to(`pr:${Number(createCommentDto.pullRequestId)}`)
      .emit('newComment', serializedComment);

    return serializedComment;
  }

  async findAll(prId: number) {
    const comments = await this.prisma.comment.findMany({
      where: {
        pullRequestId: prId,
      },
      include: {
        user: true,
      },
    });

    return comments.map(serializeComments);
  }

  async findOne(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return serializeComments(comment);
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.prisma.comment.update({
      where: {
        id,
      },
      data: updateCommentDto,
    });

    return serializeComments(comment);
  }

  async remove(id: number) {
    const comment = await this.prisma.comment.delete({
      where: {
        id,
      },
    });

    return serializeComments(comment);
  }
}
