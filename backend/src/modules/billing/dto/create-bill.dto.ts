import { IsString, IsOptional, IsEnum, IsDecimal, IsArray, ValidateNested, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class BillItemDto {
  @ApiProperty({ description: 'Item description', example: 'Consultation Fee' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Quantity', example: 1 })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: '150.00' })
  @IsDecimal()
  unitPrice: string;

  @ApiProperty({ description: 'Total price for this item', example: '150.00' })
  @IsDecimal()
  totalPrice: string;
}

export class CreateBillDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'Total amount before tax and discount', example: '500.00' })
  @IsDecimal()
  totalAmount: string;

  @ApiPropertyOptional({ description: 'Tax amount', example: '50.00' })
  @IsOptional()
  @IsDecimal()
  taxAmount?: string;

  @ApiPropertyOptional({ description: 'Discount amount', example: '25.00' })
  @IsOptional()
  @IsDecimal()
  discountAmount?: string;

  @ApiPropertyOptional({ description: 'Amount already paid', example: '0.00' })
  @IsOptional()
  @IsDecimal()
  paidAmount?: string;

  @ApiPropertyOptional({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.cash
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Payment status',
    enum: PaymentStatus,
    default: PaymentStatus.pending
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Due date', example: '2024-02-15' })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  dueDate?: Date;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Bill items', type: [BillItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  billItems: BillItemDto[];
}