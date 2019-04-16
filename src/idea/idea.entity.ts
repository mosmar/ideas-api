import { CommentEntity } from './../comment/comment.entity';
import { UserEntity } from './../user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinTable, ManyToMany, OneToMany } from 'typeorm';

@Entity('idea')
export class IdeaEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @CreateDateColumn() updated: Date;

    @CreateDateColumn() created: Date;

    @Column('text') idea: string;

    @Column('text') description: string;

    @ManyToOne(type => UserEntity, author => author.ideas)
    author: UserEntity;

    @ManyToMany(type => UserEntity, { cascade: true })
    @JoinTable()
    upvotes: UserEntity[];

    @ManyToMany(type => UserEntity, { cascade: true })
    @JoinTable()
    downvotes: UserEntity[];

    @OneToMany(type => CommentEntity, comment => comment.idea, { cascade: true })
    comments: CommentEntity[];
}