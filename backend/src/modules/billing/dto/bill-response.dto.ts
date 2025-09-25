import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class BillItemResponseDto {
  @ApiProperty({ description: 'Bill item ID' })
  id: string;

  @ApiProperty({ description: 'Item description' })
  description: string;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  unitPrice: string;

  @ApiProperty({ description: 'Total price for this item' })
  totalPrice: string;
}

export class BillResponseDto {
  @ApiProperty({ description: 'Bill unique ID' })
  id: string;

  @ApiProperty({ description: 'Invoice number' })
  invoiceNumber: string;

  @ApiProperty({ description: 'Patient ID' })
  patientId: string;

  @ApiProperty({ description: 'Total amount before tax and discount' })
  totalAmount: string;

  @ApiProperty({ description: 'Tax amount' })
  taxAmount: string;

  @ApiProperty({ description: 'Discount amount' })
  discountAmount: string;

  @ApiProperty({ description: 'Amount paid' })
  paidAmount: string;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  paymentMethod: PaymentMethod | null;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Due date' })
  dueDate: Date | null;

  @ApiProperty({ description: 'Additional notes' })
  notes: string | null;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  // Relations
  patient?: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    phone: string;
  };

  @ApiProperty({ description: 'Bill items', type: [BillItemResponseDto] })
  billItems: BillItemResponseDto[];

  // Computed fields
  @ApiProperty({ description: 'Final amount after tax and discount' })
  finalAmount?: string;

  @ApiProperty({ description: 'Outstanding balance' })
  balance?: string;

  @ApiProperty({ description: 'Whether bill is overdue' })
  isOverdue?: boolean;
}