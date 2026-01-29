import { IsNotEmpty, IsString } from 'class-validator';

export class GetPaymentStatusDto {
  @IsString()
  @IsNotEmpty()
  individual_id: string;

  @IsString()
  @IsNotEmpty()
  account_id: string;

  @IsString()
  @IsNotEmpty()
  paymentId: string;
}
