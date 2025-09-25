import { PartialType } from '@nestjs/swagger';
import { CreateBillDto } from './create-bill.dto';
import { IsOptional, IsDecimal, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class UpdateBillDto extends PartialType(CreateBillDto) {
  @ApiPropertyOptional({ description: 'Additional payment amount', example: '100.00' })
  @IsOptional()
  @IsDecimal()
  additionalPayment?: string;

  @ApiPropertyOptional({
    description: 'Update payment method',
    enum: PaymentMethod
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Update payment status',
    enum: PaymentStatus
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}