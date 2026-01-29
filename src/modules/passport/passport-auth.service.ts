import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { TokenResponseDto } from './dto/token-response.dto';

interface CachedToken {
  access_token: string;
  expiresAt: number;
}

@Injectable()
export class PassportAuthService {
  private readonly logger = new Logger(PassportAuthService.name);
  private tokenCache: CachedToken | null = null;
  private readonly apiUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    const rawUrl = this.config.get<string>('passport.apiUrl') ?? '';
    this.apiUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    this.clientId = this.config.get<string>('passport.clientId') ?? '';
    this.clientSecret = this.config.get<string>('passport.clientSecret') ?? '';
  }

  async getAccessToken(): Promise<string> {
    // Verificar si hay un token válido en cache
    if (this.tokenCache && this.isTokenValid()) {
      this.logger.debug('Using cached access token');
      return this.tokenCache.access_token;
    }

    // Solicitar nuevo token
    this.logger.log('Requesting new access token from Passport');
    return this.requestNewToken();
  }

  private async requestNewToken(): Promise<string> {
    const url = `${this.apiUrl}/iam/oauth/tokens`;
    const body = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
    };

    try {
      this.logger.debug(`POST ${url}`, { client_id: this.clientId });
      const response = await firstValueFrom(
        this.httpService.post<TokenResponseDto>(url, body, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      const tokenData = response.data;
      this.logger.log('Access token obtained successfully', {
        token_id: tokenData.token_id,
        expires_in: tokenData.expires_in,
        account_id: tokenData.account_id,
        scopes: tokenData.scopes,
      });

      // Cachear el token (24 horas = 86400000 ms, pero usamos expires_in del response)
      const expiresIn = tokenData.expires_in * 1000; // convertir a ms
      const expiresAt = Date.now() + expiresIn;
      this.tokenCache = {
        access_token: tokenData.access_token,
        expiresAt,
      };

      this.logger.debug(
        `Token cached, expires in ${tokenData.expires_in}s (${Math.round(tokenData.expires_in / 3600)} hours)`,
      );
      return tokenData.access_token;
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  private isTokenValid(): boolean {
    if (!this.tokenCache) return false;
    // Verificar si el token expira en los próximos 5 minutos (margen de seguridad)
    const margin = 5 * 60 * 1000; // 5 minutos en ms
    return this.tokenCache.expiresAt > Date.now() + margin;
  }

  private handleAuthError(error: unknown): never {
    if (this.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;

      this.logger.error('Authentication failed', {
        status,
        error: errorData ?? error.message,
      });

      if (status === 401) {
        throw new HttpException(
          {
            message: 'Invalid Passport credentials',
            error: 'Authentication failed',
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
      'Failed to authenticate with Passport API',
      HttpStatus.BAD_GATEWAY,
      { cause: error },
    );
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return (
      typeof error === 'object' && error !== null && 'isAxiosError' in error
    );
  }

  // Método para limpiar el cache (útil para testing)
  clearCache(): void {
    this.tokenCache = null;
    this.logger.debug('Token cache cleared');
  }
}

