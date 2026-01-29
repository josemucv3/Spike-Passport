import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PassportController } from './passport.controller';
import { PassportService } from './passport.service';
import { PassportAuthService } from './passport-auth.service';
import { PassportPaymentService } from './passport-payment.service';
import { PassportHttpAdapter } from './adapters/passport-http.adapter';

@Module({
  imports: [HttpModule],
  controllers: [PassportController],
  providers: [
    PassportService,
    PassportAuthService,
    PassportPaymentService,
    PassportHttpAdapter,
  ],
  exports: [PassportService, PassportAuthService, PassportPaymentService],
})
export class PassportModule {}
