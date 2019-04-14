import { UserRO } from './../user/user.dto';
import { IsString } from 'class-validator';

export class IdeaDTO {
    @IsString()
    idea: string;
    @IsString()
    description: string;
}

export class IdeaRO {
    id?: string;
    updated: Date;
    created: Date;
    idea: string;
    description: string;
    author: UserRO;
    upvotes?: number;
    downvotes?: number;
}