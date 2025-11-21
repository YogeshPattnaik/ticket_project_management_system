import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlasService } from './slas.service';
import { SlasController } from './slas.controller';
import { SLA } from '../entities/sla.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SLA])],
  controllers: [SlasController],
  providers: [SlasService],
  exports: [SlasService],
})
export class SlasModule {}

