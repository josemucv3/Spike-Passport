import {
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO para el monto del pago (objeto anidado)
export class PaymentAmountDto {
  @IsNumber()
  @IsPositive() // valor numérico positivo > 0
  value: number;

  @IsString()
  @IsISO4217CurrencyCode() // código de moneda ISO 4217 de 3 letras (e.g. "COP")
  currency: string;
}

// DTO principal para la solicitud de pago
export class CreatePaymentDto {
  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.business_id) // Requiere individual_id si no hay business_id
  individual_id?: string;

  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.individual_id) // Requiere business_id si no hay individual_id
  business_id?: string;

  @IsUUID()
  @IsNotEmpty() // siempre se necesita el account_id del origen
  account_id: string;

  @ValidateNested()
  @Type(() => PaymentAmountDto)
  amount: PaymentAmountDto; // objeto con value y currency

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  reference: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @IsString()
  @IsNotEmpty()
  breb_key: string;
}
