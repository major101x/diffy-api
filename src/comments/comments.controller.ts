import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import type { AuthenticatedRequest } from 'src/auth/interfaces/user.interface';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(createCommentDto, req.user.id);
  }

  @Get('pr/:prId')
  findAll(@Param('prId') prId: string) {
    return this.commentsService.findAll(+prId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(+id, updateCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(+id);
  }
}
