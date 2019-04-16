import { Votes } from './../shared/votes.enum';
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { IdeaEntity } from './idea.entity';
import { IdeaDTO, IdeaRO } from './idea.dto';
import { UserEntity } from 'user/user.entity';
import { ValuesOfCorrectTypeRule } from 'graphql';

@Injectable()
export class IdeaService {

    constructor(
        @InjectRepository(IdeaEntity) private ideaRepository: Repository<IdeaEntity>,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    ) { }

    async showAll(): Promise<IdeaRO[]> {
        const ideas = await this.ideaRepository.find({ relations: ['author', 'upvotes', 'downvotes', 'comments'] });
        return ideas.map(idea => this.toResponseObject(idea));
    }

    async create(userId: string, data: IdeaDTO): Promise<IdeaRO> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const idea = await this.ideaRepository.create({ ...data, author: user });
        await this.ideaRepository.save(idea);
        return this.toResponseObject(idea);
    }

    async read(id: string): Promise<IdeaRO> {
        const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'upvotes', 'downvotes', 'comments'] });
        if (!idea) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        return this.toResponseObject(idea);
    }

    async update(id: string, userId: string, data: Partial<IdeaDTO>) {
        let idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author'] });
        if (!idea) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        this.ensureOwnership(idea, userId);
        await this.ideaRepository.update({ id }, data);
        idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'comments'] });
        return this.toResponseObject(idea);
    }

    async destroy(id: string, userId: string) {
        const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'comments'] });
        if (!idea) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        this.ensureOwnership(idea, userId);
        await this.ideaRepository.delete({ id });
        return this.toResponseObject(idea);
    }

    private toResponseObject(idea: IdeaEntity): IdeaRO {
        const responseObject: any = { ...idea, author: idea.author.toResponseObject(false) };
        if (responseObject.upvotes) {
            responseObject.upvotes = idea.upvotes.length;
        }
        if (responseObject.downvotes) {
            responseObject.downvotes = idea.downvotes.length;
        }
        return responseObject;
    }

    private ensureOwnership(idea: IdeaEntity, userId: string) {
        if (idea.author.id !== userId) {
            throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
        }
    }

    async bookmark(id: string, userId: string) {
        const idea = await this.ideaRepository.findOne({ where: { id } });
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['bookmarks'] });

        if (user.bookmarks.filter(bookmark => bookmark.id === idea.id).length < 1) {
            user.bookmarks.push(idea);
            await this.userRepository.save(user);
        } else {
            throw new HttpException('Idea already bookmarked', HttpStatus.BAD_REQUEST);
        }
        return user.toResponseObject();
    }

    async unbookmark(id: string, userId: string) {
        const idea = await this.ideaRepository.findOne({ where: { id } });
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['bookmarks'] });

        if (user.bookmarks.filter(bookmark => bookmark.id !== idea.id).length > 1) {
            await this.userRepository.save(user);
        } else {
            throw new HttpException('Idea already bookmarked', HttpStatus.BAD_REQUEST);
        }
        return user.toResponseObject();
    }

    async upvote(id: string, userId: string) {
        let idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'upvotes', 'downvotes', 'comments'] });
        const user = await this.userRepository.findOne({ where: { id: userId } });
        idea = await this.vote(idea, user, Votes.UP);
        return this.toResponseObject(idea);
    }

    async downvote(id: string, userId: string) {
        let idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'upvotes', 'downvotes', 'comments'] });
        const user = await this.userRepository.findOne({ where: { id: userId } });
        idea = await this.vote(idea, user, Votes.DOWN);
        return this.toResponseObject(idea);
    }

    private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes) {
        const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;
        if (
            idea[opposite].filter(voter => voter.id === user.id).length > 0 ||
            idea[vote].filter(voter => voter.id === user.id).length > 0
        ) {
            idea[opposite] = idea[opposite].filter(voter => voter.id !== user.id);
            idea[vote] = idea[vote].filter(voter => voter.id !== user.id);
            await this.ideaRepository.save(idea);
        } else if (idea[vote].filter(voter => voter.id === user.id).length < 1) {
            idea[vote].push(user);
            await this.ideaRepository.save(idea);
        } else {
            throw new HttpException('Unable to cast vote', HttpStatus.BAD_REQUEST);
        }
        return idea;
    }
}
