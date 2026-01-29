import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportHttpAdapter } from './adapters/passport-http.adapter';
import {
  PassportPaymentRequest,
  PassportPaymentResponse,
  PassportWebhookEvent,
} from './passport.types';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateIndividualDto } from './dto/create-individual.dto';
import { CreateBusinessDto } from './dto/create-business.dto';
import { LinkAccountDto } from './dto/link-account.dto';
import { createHmac } from 'crypto';

@Injectable()
export class PassportService {
  private readonly logger = new Logger(PassportService.name);
  private readonly webhookSecret: string;

  constructor(
    private readonly passportHttpAdapter: PassportHttpAdapter,
    private readonly config: ConfigService,
  ) {
    this.webhookSecret = this.config.get<string>('passport.webhookSecret') ?? '';
  }

  /**
   * @deprecated Este método usa el endpoint /customers que no está implementado.
   * Usa createBusiness() en su lugar para crear clientes mediante Link a Merchant.
   */
  async createIndividual(dto: CreateIndividualDto): Promise<unknown> {
    this.logger.warn(
      'createIndividual is deprecated. Use createBusiness() instead via /customers/business/link endpoint.',
    );
    throw new HttpException(
      {
        message:
          'Creating individual customers directly is not supported. Use the business/link endpoint instead.',
        error: 'Not Implemented',
        statusCode: 501,
      },
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  /**
   * Crea/vincula un cliente tipo BUSINESS (Merchant) en Passport PaaS
   * usando el endpoint Link a Merchant: /v1/customers/business/link
   * NOTA: No incluir 'type' en el payload, el endpoint ya es específico para BUSINESS
   */
  async createBusiness(dto: CreateBusinessDto): Promise<unknown> {
    const path = '/customers/business/link';

    // Construir payload según documentación de Passport Link a Merchant
    // El campo 'type' NO se envía porque el endpoint ya es específico para BUSINESS
    const payload = {
      business_name: dto.business_name,
      email: dto.email,
      mobile_phone_number: dto.mobile_phone_number,
      identification_type: dto.identification_type,
      identification_number: dto.identification_number, // NIT sin dígito verificador
      address: dto.address,
      merchant_category_code: dto.merchant_category_code, // MCC de 4 dígitos
    };

    this.logger.log('Linking business customer (Merchant) in Passport', {
      business_name: dto.business_name,
      email: dto.email,
      identification_type: dto.identification_type,
    });

    try {
      return await this.passportHttpAdapter.post<unknown, typeof payload>(
        path,
        payload,
      );
    } catch (error) {
      this.handleBusinessCreationError(error);
    }
  }

  /**
   * Vincula una cuenta bancaria a un cliente existente
   * usando el endpoint Link Account: /v1/accounts/link
   */
  async linkAccount(dto: LinkAccountDto): Promise<unknown> {
    const path = '/accounts/link';

    // Construir payload según documentación de Passport Link Account
    const payload = {
      customer_id: dto.customer_id,
      account_type: dto.account_type,
      account_number: dto.account_number,
    };

    this.logger.log('Linking account to customer in Passport', {
      customer_id: dto.customer_id,
      account_type: dto.account_type,
      account_number: dto.account_number,
    });

    try {
      return await this.passportHttpAdapter.post<unknown, typeof payload>(
        path,
        payload,
      );
    } catch (error) {
      this.handleLinkAccountError(error);
    }
  }

  private handleBusinessCreationError(error: unknown): never {
    if (this.isHttpException(error)) {
      const status = error.getStatus();
      const response = error.getResponse();

      // Manejo específico de errores comunes
      if (status === 400) {
        this.logger.error('Invalid request data for business creation', response);
        throw new HttpException(
          {
            message:
              'Invalid request data. Please check all required fields and formats (business_name, email, mobile_phone_number, identification_type, identification_number, address, merchant_category_code).',
            error: 'Bad Request',
            statusCode: 400,
            details: response,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (status === 401) {
        this.logger.error('Authentication failed when creating business');
        throw new HttpException(
          {
            message: 'Authentication failed. Token may be invalid or expired.',
            error: 'Unauthorized',
            statusCode: 401,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (status === 409) {
        this.logger.error(
          'Business already exists (duplicate email or identification)',
        );
        throw new HttpException(
          {
            message:
              'A customer with this email or identification number already exists.',
            error: 'Conflict',
            statusCode: 409,
            details: response,
          },
          HttpStatus.CONFLICT,
        );
      }

      // Re-lanzar otros errores HTTP
      throw error;
    }

    // Error desconocido
    this.logger.error('Unexpected error creating business', error);
    throw new HttpException(
      {
        message: 'Failed to create business customer',
        error: 'Internal Server Error',
        statusCode: 500,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private handleLinkAccountError(error: unknown): never {
    if (this.isHttpException(error)) {
      const status = error.getStatus();
      const response = error.getResponse();

      if (status === 400) {
        this.logger.error('Invalid request data for linking account', response);
        throw new HttpException(
          {
            message:
              'Invalid request data. Please check customer_id, account_type, and account_number.',
            error: 'Bad Request',
            statusCode: 400,
            details: response,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (status === 401) {
        this.logger.error('Authentication failed when linking account');
        throw new HttpException(
          {
            message: 'Authentication failed. Token may be invalid or expired.',
            error: 'Unauthorized',
            statusCode: 401,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (status === 404) {
        this.logger.error('Customer not found when linking account');
        throw new HttpException(
          {
            message: 'Customer not found. Make sure the customer_id is correct.',
            error: 'Not Found',
            statusCode: 404,
            details: response,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Re-lanzar otros errores HTTP
      throw error;
    }

    // Error desconocido
    this.logger.error('Unexpected error linking account', error);
    throw new HttpException(
      {
        message: 'Failed to link account to customer',
        error: 'Internal Server Error',
        statusCode: 500,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private isHttpException(error: unknown): error is HttpException {
    return error instanceof HttpException;
  }

  async createPayment(dto: CreatePaymentDto): Promise<unknown> {
    // Validar que se proporcione individual_id o business_id (al menos uno)
    if (!dto.individual_id && !dto.business_id) {
      throw new HttpException(
        {
          message:
            'Either individual_id or business_id must be provided in the request body',
          error: 'Bad Request',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validar que no se envíen ambos IDs a la vez (evitar ambigüedad)
    if (dto.individual_id && dto.business_id) {
      throw new HttpException(
        {
          message:
            'Cannot provide both individual_id and business_id. Provide only one.',
          error: 'Bad Request',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Construir endpoint según el tipo de cliente
    // /v1/individuals/{individual_id}/accounts/{account_id}/payments
    // o /v1/businesses/{business_id}/accounts/{account_id}/payments
    let path: string;
    if (dto.business_id) {
      path = `/businesses/${dto.business_id}/accounts/${dto.account_id}/payments`;
    } else {
      path = `/individuals/${dto.individual_id}/accounts/${dto.account_id}/payments`;
    }

    // Construir payload según documentación de Passport
    // NO incluir customer_id ni account_id en el body - van en la URL
    // amount ya viene como objeto { value, currency } desde el DTO
    const payload = {
      amount: dto.amount, // objeto { value, currency } ya validado
      reference: dto.reference,
      description: dto.description,
      breb_key: dto.breb_key,
    };

    this.logger.log('Creating payment', {
      path,
      customer_type: dto.business_id ? 'business' : 'individual',
      customer_id: dto.business_id || dto.individual_id,
      account_id: dto.account_id,
      breb_key: dto.breb_key,
    });

    // Retornar la respuesta de Passport tal cual (passthrough)
    return this.passportHttpAdapter.post<unknown, typeof payload>(
      path,
      payload,
    );
  }

  async getPaymentStatus(
    individualId: string,
    accountId: string,
    paymentId: string,
  ): Promise<PassportPaymentResponse> {
    // Construir endpoint según documentación: /v1/individuals/{individual_id}/accounts/{account_id}/payments/{payment_id}
    const path = `/individuals/${individualId}/accounts/${accountId}/payments/${paymentId}`;
    return this.passportHttpAdapter.get<PassportPaymentResponse>(path);
  }

  async handleWebhook(event: PassportWebhookEvent): Promise<void> {
    this.verifyWebhook(event);
    console.log('[PassportService][Webhook] Event received', event);

    // Placeholder for future webhook handling logic (persist, emit domain events, etc.)
  }

  private verifyWebhook(event: PassportWebhookEvent) {
    if (!this.webhookSecret) {
      console.log(
        '[PassportService][Webhook] Secret not configured, skipping verification',
      );
      return;
    }

    const expectedSignature = createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(event.data))
      .digest('hex');

    if (expectedSignature !== event.signature) {
      throw new UnauthorizedException('Invalid Passport webhook signature');
    }
  }
}
