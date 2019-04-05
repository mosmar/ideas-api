import { IsString } from 'class-validator';
import { isString } from 'util';

export class IdeaDTO {
    @IsString()
    idea: string;
    @IsString()
    description: string;
}