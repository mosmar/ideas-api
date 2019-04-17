import { UserEntity } from 'user/user.entity';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { Repository } from 'typeorm';
import { IdeaEntity } from 'idea/idea.entity';
import { CommentDTO } from './comment.dto';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(CommentEntity) private commentRepository: Repository<CommentEntity>,
        @InjectRepository(IdeaEntity) private ideaRepository: Repository<IdeaEntity>,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
    ) { }

    async show(id: string) {
        const comment = await this.commentRepository.findOne({ where: { id }, relations: ['author', 'idea'] });
        return this.toResponeObject(comment);
    }

    async create(ideaId: string, userId: string, data: CommentDTO) {
        const idea = await this.ideaRepository.findOne({ where: { id: ideaId } });
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const comment = await this.commentRepository.create({ ...data, idea, author: user });
        await this.commentRepository.save(comment);
        return this.toResponeObject(comment);
    }

    async destroy(id: string, userId: string) {
        const comment = await this.commentRepository.findOne({ where: { id }, relations: ['author', 'idea'] })
        if (comment.author.id !== userId) {
            throw new HttpException('You do not own this comment', HttpStatus.UNAUTHORIZED);
        }
        await this.commentRepository.remove(comment);
        return this.toResponeObject(comment);
    }

    async showByIdea(id: string, page: number = 1) {
        const comments = await this.commentRepository.find({
            where: { author: { id } }, relations: ['author'],
            take: 5,
            skip: 5 * (page - 1),
        });
        return comments.map(comment => this.toResponeObject(comment));
    }

    async showByUser(id: string, page: number = 1) {
        const comments = await this.commentRepository.find({
            where: { author: { id } }, relations: ['author'],
            take: 5,
            skip: 5 * (page - 1),
        });
        return comments.map(comment => this.toResponeObject(comment));
    }

    private toResponeObject(comment: CommentEntity) {
        const responseObject: any = comment;
        if (comment.author) {
            responseObject.author = comment.author.toResponseObject();
        }
        return responseObject;
    }
}
