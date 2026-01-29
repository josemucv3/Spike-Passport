import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PassportService } from './passport.service';
import { PassportAuthService } from './passport-auth.service';
import { PassportPaymentService } from './passport-payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateIndividualDto } from './dto/create-individual.dto';
import { CreateBusinessDto } from './dto/create-business.dto';
import { LinkAccountDto } from './dto/link-account.dto';
import { GetPaymentStatusDto } from './dto/get-payment-status.dto';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { PassportWebhookEvent } from './passport.types';

@Controller('passport')
export class PassportController {
  constructor(
    private readonly passportService: PassportService,
    private readonly authService: PassportAuthService,
    private readonly paymentService: PassportPaymentService,
  ) {}

  @Get('auth/token')
  async getToken() {
    const token = await this.authService.getAccessToken();
    return {
      access_token: token,
      message: 'Token retrieved successfully',
    };
  }

  @Post('individuals')
  async createIndividual(@Body() dto: CreateIndividualDto) {
    return this.passportService.createIndividual(dto);
  }

  @Post('business/link')
  async createBusiness(@Body() dto: CreateBusinessDto) {
    return this.passportService.createBusiness(dto);
  }

  @Post('accounts/link')
  async linkAccount(@Body() dto: LinkAccountDto) {
    return this.passportService.linkAccount(dto);
  }

  @Post('payment/simulate')
  async simulatePayment(@Body() dto: PaymentRequestDto) {
    return this.paymentService.simulatePayment(dto);
  }

  @Post('payment')
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.passportService.createPayment(dto);
  }

  @Get('payment/:individual_id/:account_id/:paymentId')
  getPaymentStatus(@Param() params: GetPaymentStatusDto) {
    return this.passportService.getPaymentStatus(
      params.individual_id,
      params.account_id,
      params.paymentId,
    );
  }

  @Post('webhook')
  async handleWebhook(@Body() event: PassportWebhookEvent) {
    await this.passportService.handleWebhook(event);
    return { received: true };
  }
}
