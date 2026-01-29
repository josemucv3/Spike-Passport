import {
  IsEnum,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export enum CustomerType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export class PaymentRequestDto {
  @IsEnum(CustomerType)
  customer_type: CustomerType;

  @IsString()
  @IsNotEmpty()
  customer_id: string; // individual_id o business_id

  @IsString()
  @IsNotEmpty()
  account_id: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsISO4217CurrencyCode()
  currency: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  reference: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsString()
  @IsOptional()
  recipient_id?: string; // ID del destinatario creado

  @IsString()
  @IsOptional()
  breb_key?: string; // Bre-B Key resuelto (alternativa a recipient_id)
}

