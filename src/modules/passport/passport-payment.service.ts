import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { PassportAuthService } from './passport-auth.service';
import { PaymentRequestDto, CustomerType } from './dto/payment-request.dto';

@Injectable()
export class PassportPaymentService {
  private readonly logger = new Logger(PassportPaymentService.name);
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly authService: PassportAuthService,
  ) {
    const rawUrl = this.config.get<string>('passport.apiUrl') ?? '';
    this.apiUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
  }

  async simulatePayment(paymentRequest: PaymentRequestDto): Promise<unknown> {
    const token = await this.authService.getAccessToken();
    
    // Construir URL según el tipo de cliente (individual o business)
    const customerPath =
      paymentRequest.customer_type === CustomerType.INDIVIDUAL
        ? 'individuals'
        : 'businesses';
    const url = `${this.apiUrl}/${customerPath}/${paymentRequest.customer_id}/accounts/${paymentRequest.account_id}/payments`;

    // Construir payload según documentación
    const payload: Record<string, unknown> = {
      amount: {
        value: paymentRequest.amount,
        currency: paymentRequest.currency,
      },
      reference: paymentRequest.reference,
      ...(paymentRequest.description && { description: paymentRequest.description }),
    };

    // Agregar recipient_id o breb_key según lo que se proporcione
    if (paymentRequest.recipient_id) {
      payload.recipient_id = paymentRequest.recipient_id;
    } else if (paymentRequest.breb_key) {
      payload.breb_key = paymentRequest.breb_key;
    } else {
      throw new HttpException(
        {
          message: 'Either recipient_id or breb_key must be provided',
          error: 'Bad Request',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      this.logger.log(
        `Simulating payment for ${paymentRequest.customer_type} ${paymentRequest.customer_id}, account ${paymentRequest.account_id}`,
      );
      this.logger.debug('Payment request', {
        url,
        payload,
        headers: { ...headers, Authorization: 'Bearer ***' },
      });

      const response = await firstValueFrom(
        this.httpService.post(url, payload, { headers }),
      );

      this.logger.log('Payment simulation completed successfully');
      return response.data;
    } catch (error) {
      this.handlePaymentError(error, url);
    }
  }

  private handlePaymentError(error: unknown, url: string): never {
    if (this.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      this.logger.error('Payment simulation failed', {
        status,
        url,
        error: errorData ?? error.message,
      });

      // Manejo de errores según documentación
      if (status === 401) {
        throw new HttpException(
          {
            message: 'Missing, invalid or expired access token',
            error: 'Unauthorized',
            statusCode: 401,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (status === 403) {
        throw new HttpException(
          {
            message: 'Insufficient permissions for this operation',
            error: 'Forbidden',
            statusCode: 403,
          },
          HttpStatus.FORBIDDEN,
        );
      }

      if (status === 404) {
        throw new HttpException(
          {
            message: 'Resource not found (customer, account, or recipient)',
            error: 'Not Found',
            statusCode: 404,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (errorData) {
        throw new HttpException(
          errorData,
          status ?? HttpStatus.BAD_GATEWAY,
        );
      }
    }

    throw new HttpException(
      'Failed to process payment request',
      HttpStatus.BAD_GATEWAY,
      { cause: error },
    );
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return (
      typeof error === 'object' && error !== null && 'isAxiosError' in error
    );
  }
}

