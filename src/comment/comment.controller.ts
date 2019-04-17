import { Controller, Get, Param, UseGuards, UsePipes, Body, Post, ValidationPipe, Delete, Query } from '@nestjs/common';
import { User } from 'user/user.decorator';
import { AuthGuard } from 'shared/auth.gaurd';
import { CommentDTO } from './comment.dto';
import { CommentService } from './comment.service';

@Controller('api/comments')
export class CommentController {
    constructor(private commentService: CommentService) {}

    @Get('idea/:id')
    showCommentsByIdea(@Param('id') idea: string, @Query('page') page: number) {
        return this.commentService.showByIdea(idea, page);
    }

    @Get('user/:id')
    showCommentsByUser(@Param('id') user: string, @Query('page') page: number) {
        return this.commentService.showByUser(user, page);
    }

    @Post('idea/:id')
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    createComment(@Param('id') idea: string, @User('id') user: string, @Body() data: CommentDTO) {
        return this.commentService.create(idea, user, data);
    }

    @Get(':id')
    showComment(@Param('id') id: string) {
        return this.commentService.show(id);
    }

    @Delete(':id')
    @UseGuards(new AuthGuard())
    destroyComment(@Param('id') id: string, @User('id') user: string) {
        return this.commentService.destroy(id, user);
    }
}
