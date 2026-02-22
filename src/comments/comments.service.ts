import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCommentDto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: createCommentDto,
    });
  }

  findAll(prId: number) {
    return this.prisma.comment.findMany({
      where: {
        pullRequestId: prId,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.comment.findUnique({
      where: {
        id,
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
