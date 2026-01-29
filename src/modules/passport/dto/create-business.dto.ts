import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum BusinessIdentificationType {
  NIT = 'NIT', // Número de Identificación Tributaria
}

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  line_1: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  post_code?: string;

  @IsString()
  @IsOptional()
  country?: string;
}

export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  business_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{10,15}$/, {
    message:
      'mobile_phone_number must be in international format, e.g., +573001112233',
  })
  mobile_phone_number: string;

  @IsEnum(BusinessIdentificationType)
  @IsNotEmpty()
  identification_type: BusinessIdentificationType;

  @IsString()
  @IsNotEmpty()
  identification_number: string; // NIT sin dígito verificador

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(4)
  @Matches(/^\d{4}$/, {
    message: 'merchant_category_code must be a 4-digit code',
  })
  merchant_category_code: string; // MCC de 4 dígitos
}

