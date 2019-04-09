import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { IdeaController } from './idea.controller';
import { IdeaService } from './idea.service';
import { IdeaEntity } from 'idea/idea.entity';
import { UserEntity } from 'user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([IdeaEntity]),
    TypeOrmModule.forFeature([UserEntity])
  ],
  controllers: [IdeaController],
  providers: [IdeaService],
})
export class IdeaModule {}
