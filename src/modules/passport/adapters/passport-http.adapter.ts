import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { PassportAuthService } from '../passport-auth.service';

@Injectable()
export class PassportHttpAdapter {
  private readonly logger = new Logger(PassportHttpAdapter.name);
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly authService: PassportAuthService,
  ) {
    const rawUrl = this.config.get<string>('passport.apiUrl') ?? '';
    // Normalizar URL: remover slash final si existe
    this.apiUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
  }

  async post<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
    this.ensureConfiguration();
    const url = this.buildUrl(path);
    
    // Obtener token antes de cada llamada
    const token = await this.authService.getAccessToken();
    const headers = this.buildHeaders(token);

    try {
      this.logger.debug('[PassportHttpAdapter][POST] Request', {
        url,
        body,
        headers: { ...headers, Authorization: 'Bearer ***' },
      });
      const response = await firstValueFrom(
        this.httpService.post<TResponse>(url, body, { headers }),
      );
      this.logger.debug('[PassportHttpAdapter][POST] Response', response.data);
      return response.data;
    } catch (error) {
      this.handleError('POST', url, error);
    }
  }

  async get<TResponse>(path: string): Promise<TResponse> {
    this.ensureConfiguration();
    const url = this.buildUrl(path);
    
    // Obtener token antes de cada llamada
    const token = await this.authService.getAccessToken();
    const headers = this.buildHeaders(token);

    try {
      this.logger.debug('[PassportHttpAdapter][GET] Request', {
        url,
        headers: { ...headers, Authorization: 'Bearer ***' },
      });
      const response = await firstValueFrom(
        this.httpService.get<TResponse>(url, { headers }),
      );
      this.logger.debug('[PassportHttpAdapter][GET] Response', response.data);
      return response.data;
    } catch (error) {
      this.handleError('GET', url, error);
    }
  }

  private buildHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private handleError(
    method: 'GET' | 'POST',
    url: string,
    error: unknown,
  ): never {
    if (this.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      this.logger.error('[PassportHttpAdapter][Error]', {
        method,
        url,
        status,
        error: errorData ?? error.message,
      });

      // Manejo específico de errores según documentación
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

      if (errorData) {
        throw new HttpException(
          errorData,
          status ?? HttpStatus.BAD_GATEWAY,
        );
      }
    }

    throw new HttpException(
      'Passport API communication failed',
      HttpStatus.BAD_GATEWAY,
      { cause: error },
    );
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return (
      typeof error === 'object' && error !== null && 'isAxiosError' in error
    );
  }

  private buildUrl(path: string): string {
    // Asegurar que el path empiece con /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiUrl}${normalizedPath}`;
  }

  private ensureConfiguration() {
    if (!this.apiUrl) {
      throw new HttpException(
        'Passport API URL configuration is missing',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
