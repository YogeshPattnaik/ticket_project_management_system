import { Module } from '@nestjs/common';
import { SlasService } from './slas.service';
import { SlasController } from './slas.controller';

@Module({
  controllers: [SlasController],
  providers: [SlasService],
  exports: [SlasService],
})
export class SlasModule {}

