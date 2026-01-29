import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum IdentificationType {
  CC = 'CC', // Cédula de Ciudadanía
  CE = 'CE', // Cédula de Extranjería
  NUIP = 'NUIP', // Número Único de Identificación Personal
  PPT = 'PPT', // Pasaporte
  PEP = 'PEP', // Permiso Especial de Permanencia
  PAS = 'PAS', // Pasaporte
  TDI = 'TDI', // Tarjeta de Identidad
}

export class AddressDto {
  @IsString()
  @IsOptional()
  line_1?: string;

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

export class CreateIndividualDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsOptional()
  second_name?: string;

  @IsString()
  @IsNotEmpty()
  first_last_name: string;

  @IsString()
  @IsNotEmpty()
  second_last_name: string;

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

  @IsEnum(IdentificationType)
  @IsNotEmpty()
  identification_type: IdentificationType;

  @IsString()
  @IsNotEmpty()
  identification_number: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

