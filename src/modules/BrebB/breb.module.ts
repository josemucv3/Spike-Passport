import { Module } from '@nestjs/common';
import { BrebController } from './berb.controller';
import { BrebService } from './breb.service';

@Module({
  controllers: [BrebController],
  providers: [BrebService],
})
export class BrebModule {}
