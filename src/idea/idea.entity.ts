import { UserEntity } from './../user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinTable, ManyToMany } from 'typeorm';

@Entity('idea')
export class IdeaEntity {
    @PrimaryGeneratedColumn('uuid') id: string;

    @CreateDateColumn() updated: Date;

    @CreateDateColumn() created: Date;

    @Column('text') idea: string;

    @Column('text') description: string;

    @ManyToOne(type => UserEntity, author => author.ideas)
    author: UserEntity;

    @ManyToMany(type => UserEntity, { cascade: true} )
    @JoinTable()
    upvotes: UserEntity[];

    @ManyToMany(type => UserEntity, { cascade: true} )
    @JoinTable()
    downvotes: UserEntity[];
}