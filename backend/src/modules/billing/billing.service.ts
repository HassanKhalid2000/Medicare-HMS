import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/database.service';
import { CreateBillDto, UpdateBillDto, BillQueryDto, ProcessPaymentDto } from './dto';
import { Bill, Prisma } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async create(createBillDto: CreateBillDto): Promise<Bill> {
    // Validate patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: createBillDto.patientId }
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate final amounts
    const totalAmount = new Prisma.Decimal(createBillDto.totalAmount);
    const taxAmount = new Prisma.Decimal(createBillDto.taxAmount || '0');
    const discountAmount = new Prisma.Decimal(createBillDto.discountAmount || '0');
    const paidAmount = new Prisma.Decimal(createBillDto.paidAmount || '0');

    // Validate amounts
    if (taxAmount.lt(0) || discountAmount.lt(0) || paidAmount.lt(0)) {
      throw new BadRequestException('Amounts cannot be negative');
    }

    const finalAmount = totalAmount.plus(taxAmount).minus(discountAmount);
    if (paidAmount.gt(finalAmount)) {
      throw new BadRequestException('Paid amount cannot exceed final amount');
    }

    // Determine payment status
    let paymentStatus = createBillDto.paymentStatus || 'pending';
    if (paidAmount.gte(finalAmount)) {
      paymentStatus = 'paid';
    } else if (paidAmount.gt(0)) {
      paymentStatus = 'partial';
    }

    // Set due date if not provided (30 days from now)
    const dueDate = createBillDto.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return this.prisma.bill.create({
      data: {
        invoiceNumber,
        patientId: createBillDto.patientId,
        totalAmount,
        taxAmount,
        discountAmount,
        paidAmount,
        paymentMethod: createBillDto.paymentMethod,
        paymentStatus: paymentStatus as any,
        dueDate,
        notes: createBillDto.notes,
        billItems: {
          create: createBillDto.billItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            totalPrice: new Prisma.Decimal(item.totalPrice)
          }))
        }
      },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        billItems: true
      }
    });
  }

  async findAll(query: BillQueryDto) {
    const {
      search,
      patientId,
      paymentStatus,
      paymentMethod,
      dateFrom,
      dateTo,
      overdue,
      page,
      limit,
      sortBy,
      sortOrder
    } = query;

    const skip = (page - 1) * limit;
    const now = new Date();

    const where: Prisma.BillWhereInput = {
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search } },
          {
            patient: {
              OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { patientId: { contains: search } }
              ]
            }
          }
        ]
      }),
      ...(patientId && { patientId }),
      ...(paymentStatus && { paymentStatus }),
      ...(paymentMethod && { paymentMethod }),
      ...(dateFrom && dateTo && {
        createdAt: {
          gte: dateFrom,
          lte: dateTo
        }
      }),
      ...(dateFrom && !dateTo && {
        createdAt: { gte: dateFrom }
      }),
      ...(!dateFrom && dateTo && {
        createdAt: { lte: dateTo }
      }),
      ...(overdue && {
        AND: [
          { dueDate: { lt: now } },
          { paymentStatus: { not: 'paid' } }
        ]
      })
    };

    const orderBy: Prisma.BillOrderByWithRelationInput = {
      [sortBy]: sortOrder
    };

    const [bills, total] = await Promise.all([
      this.prisma.bill.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          billItems: true
        }
      }),
      this.prisma.bill.count({ where })
    ]);

    // Add computed fields
    const billsWithComputedFields = bills.map(bill => {
      const finalAmount = bill.totalAmount.plus(bill.taxAmount).minus(bill.discountAmount);
      const balance = finalAmount.minus(bill.paidAmount);
      const isOverdue = bill.dueDate ? bill.dueDate < now && bill.paymentStatus !== 'paid' : false;

      return {
        ...bill,
        finalAmount: finalAmount.toString(),
        balance: balance.toString(),
        isOverdue
      };
    });

    return {
      data: billsWithComputedFields,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string): Promise<Bill> {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true,
            address: true
          }
        },
        billItems: true
      }
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    // Add computed fields
    const finalAmount = bill.totalAmount.plus(bill.taxAmount).minus(bill.discountAmount);
    const balance = finalAmount.minus(bill.paidAmount);
    const isOverdue = bill.dueDate ? bill.dueDate < new Date() && bill.paymentStatus !== 'paid' : false;

    return {
      ...bill,
      finalAmount: finalAmount.toString(),
      balance: balance.toString(),
      isOverdue
    } as any;
  }

  async update(id: string, updateBillDto: UpdateBillDto): Promise<Bill> {
    // Check if bill exists
    await this.findOne(id);

    const updateData: any = { ...updateBillDto };

    // Handle additional payment
    if (updateBillDto.additionalPayment) {
      const existingBill = await this.prisma.bill.findUnique({ where: { id } });
      const additionalAmount = new Prisma.Decimal(updateBillDto.additionalPayment);
      const newPaidAmount = existingBill.paidAmount.plus(additionalAmount);

      updateData.paidAmount = newPaidAmount;
      delete updateData.additionalPayment;

      // Update payment status based on new paid amount
      const finalAmount = existingBill.totalAmount
        .plus(existingBill.taxAmount)
        .minus(existingBill.discountAmount);

      if (newPaidAmount.gte(finalAmount)) {
        updateData.paymentStatus = 'paid';
      } else if (newPaidAmount.gt(0)) {
        updateData.paymentStatus = 'partial';
      }
    }

    // Convert decimal fields
    if (updateBillDto.totalAmount) updateData.totalAmount = new Prisma.Decimal(updateBillDto.totalAmount);
    if (updateBillDto.taxAmount) updateData.taxAmount = new Prisma.Decimal(updateBillDto.taxAmount);
    if (updateBillDto.discountAmount) updateData.discountAmount = new Prisma.Decimal(updateBillDto.discountAmount);

    return this.prisma.bill.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        billItems: true
      }
    });
  }

  async processPayment(id: string, paymentDto: ProcessPaymentDto): Promise<Bill> {
    const bill = await this.findOne(id);
    const paymentAmount = new Prisma.Decimal(paymentDto.amount);

    if (paymentAmount.lte(0)) {
      throw new BadRequestException('Payment amount must be positive');
    }

    const finalAmount = bill.totalAmount.plus(bill.taxAmount).minus(bill.discountAmount);
    const currentBalance = finalAmount.minus(bill.paidAmount);

    if (paymentAmount.gt(currentBalance)) {
      throw new BadRequestException('Payment amount exceeds outstanding balance');
    }

    const newPaidAmount = bill.paidAmount.plus(paymentAmount);
    const newPaymentStatus = newPaidAmount.gte(finalAmount) ? 'paid' : 'partial';

    return this.prisma.bill.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        paymentMethod: paymentDto.paymentMethod,
        paymentStatus: newPaymentStatus as any,
        notes: paymentDto.notes ? `${bill.notes || ''}\nPayment: ${paymentDto.notes}` : bill.notes
      },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        billItems: true
      }
    });
  }

  async remove(id: string): Promise<Bill> {
    // Check if bill exists
    await this.findOne(id);

    // Check if bill has payments
    const bill = await this.prisma.bill.findUnique({ where: { id } });
    if (bill.paidAmount.gt(0)) {
      throw new BadRequestException('Cannot delete bill with payments');
    }

    return this.prisma.bill.delete({
      where: { id },
      include: {
        billItems: true
      }
    });
  }

  async getStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [
      totalBills,
      monthlyBills,
      overdueCount,
      totalRevenue,
      monthlyRevenue,
      paymentStatusCounts
    ] = await Promise.all([
      this.prisma.bill.count(),
      this.prisma.bill.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        }
      }),
      this.prisma.bill.count({
        where: {
          dueDate: { lt: today },
          paymentStatus: { not: 'paid' }
        }
      }),
      this.prisma.bill.aggregate({
        _sum: { paidAmount: true }
      }),
      this.prisma.bill.aggregate({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        },
        _sum: { paidAmount: true }
      }),
      this.prisma.bill.groupBy({
        by: ['paymentStatus'],
        _count: {
          paymentStatus: true
        }
      })
    ]);

    return {
      totalBills,
      monthlyBills,
      overdueCount,
      totalRevenue: totalRevenue._sum.paidAmount?.toString() || '0',
      monthlyRevenue: monthlyRevenue._sum.paidAmount?.toString() || '0',
      paymentStatusBreakdown: paymentStatusCounts.map(item => ({
        status: item.paymentStatus,
        count: item._count.paymentStatus
      }))
    };
  }

  private async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const prefix = `INV-${year}-${month}${day}`;

    const lastBill = await this.prisma.bill.findFirst({
      where: {
        invoiceNumber: {
          startsWith: prefix
        }
      },
      orderBy: {
        invoiceNumber: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastBill) {
      const lastNumber = parseInt(lastBill.invoiceNumber.slice(-3));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
  }
}