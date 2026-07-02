import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { OccurrencesController } from './occurrences.controller';
import { OccurrencesService } from './occurrences.service';

@Module({
  controllers: [OccurrencesController],
  providers: [OccurrencesService, LikesService],
  exports: [OccurrencesService],
})
export class OccurrencesModule {}
