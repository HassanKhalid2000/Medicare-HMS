import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database.service';
import { CreateMedicineDto, UpdateMedicineDto, MedicineQueryDto } from './dto';
import { Medicine, Prisma } from '@prisma/client';

@Injectable()
export class PharmacyService {
  constructor(private prisma: PrismaService) {}

  async create(createMedicineDto: CreateMedicineDto): Promise<Medicine> {
    const medicine = await this.prisma.medicine.create({
      data: {
        ...createMedicineDto,
        unitPrice: new Prisma.Decimal(createMedicineDto.unitPrice),
        expiryDate: new Date(createMedicineDto.expiryDate),
      },
    });

    return medicine;
  }

  async findAll(query: MedicineQueryDto) {
    const {
      search,
      category,
      manufacturer,
      lowStock,
      expired,
      page,
      limit,
      sortBy,
      sortOrder,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.MedicineWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search } },
          { category: { contains: search } },
          { manufacturer: { contains: search } },
        ],
      }),
      ...(category && { category: { contains: category } }),
      ...(manufacturer && { manufacturer: { contains: manufacturer } }),
      ...(lowStock && {
        quantity: {
          lte: this.prisma.medicine.fields.minimumStock,
        },
      }),
      ...(expired && {
        expiryDate: {
          lte: new Date(),
        },
      }),
    };

    const orderBy: Prisma.MedicineOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [medicines, total] = await Promise.all([
      this.prisma.medicine.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.medicine.count({ where }),
    ]);

    return {
      data: medicines,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Medicine> {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            prescriptions: true,
            medicalPrescriptions: true,
          },
        },
      },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    return medicine;
  }

  async update(id: string, updateMedicineDto: UpdateMedicineDto): Promise<Medicine> {
    await this.findOne(id);

    const medicine = await this.prisma.medicine.update({
      where: { id },
      data: {
        ...updateMedicineDto,
        ...(updateMedicineDto.unitPrice && {
          unitPrice: new Prisma.Decimal(updateMedicineDto.unitPrice),
        }),
        ...(updateMedicineDto.expiryDate && {
          expiryDate: new Date(updateMedicineDto.expiryDate),
        }),
      },
    });

    return medicine;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.medicine.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const [
      total,
      lowStock,
      expired,
      categoryCounts,
    ] = await Promise.all([
      this.prisma.medicine.count(),
      this.prisma.medicine.count({
        where: {
          quantity: {
            lte: this.prisma.medicine.fields.minimumStock,
          },
        },
      }),
      this.prisma.medicine.count({
        where: {
          expiryDate: {
            lte: new Date(),
          },
        },
      }),
      this.prisma.medicine.groupBy({
        by: ['category'],
        _count: {
          category: true,
        },
        _sum: {
          quantity: true,
        },
      }),
    ]);

    return {
      total,
      lowStock,
      expired,
      byCategory: categoryCounts.map((item) => ({
        category: item.category,
        count: item._count.category,
        totalQuantity: item._sum.quantity || 0,
      })),
    };
  }

  async adjustStock(id: string, quantity: number): Promise<Medicine> {
    const medicine = await this.findOne(id);

    return this.prisma.medicine.update({
      where: { id },
      data: {
        quantity: medicine.quantity + quantity,
      },
    });
  }
}
