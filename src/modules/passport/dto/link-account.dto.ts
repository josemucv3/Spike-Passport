import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum AccountType {
  ORDINARY = 'ORDINARY', // Cuenta bancaria ordinaria
}

export class LinkAccountDto {
  @IsString()
  @IsNotEmpty()
  customer_id: string; // UUID del cliente creado mediante Link a Merchant

  @IsEnum(AccountType)
  @IsNotEmpty()
  account_type: AccountType;

  @IsString()
  @IsNotEmpty()
  account_number: string; // Número de cuenta asignado por el banco patrocinador
}

