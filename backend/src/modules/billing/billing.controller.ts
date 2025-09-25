import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery
} from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateBillDto, UpdateBillDto, BillResponseDto, BillQueryDto, ProcessPaymentDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.receptionist)
  @ApiOperation({ summary: 'Create a new bill' })
  @ApiResponse({
    status: 201,
    description: 'Bill created successfully',
    type: BillResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async create(@Body() createBillDto: CreateBillDto) {
    return this.billingService.create(createBillDto);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.receptionist)
  @ApiOperation({ summary: 'Get all bills with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Bills retrieved successfully'
  })
  async findAll(@Query() query: BillQueryDto) {
    return this.billingService.findAll(query);
  }

  @Get('statistics')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get billing statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully'
  })
  async getStatistics() {
    return this.billingService.getStatistics();
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.receptionist)
  @ApiOperation({ summary: 'Get bill by ID' })
  @ApiResponse({
    status: 200,
    description: 'Bill retrieved successfully',
    type: BillResponseDto
  })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Post(':id/payment')
  @Roles(UserRole.admin, UserRole.receptionist)
  @ApiOperation({ summary: 'Process payment for a bill' })
  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully',
    type: BillResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid payment amount' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async processPayment(@Param('id') id: string, @Body() paymentDto: ProcessPaymentDto) {
    return this.billingService.processPayment(id, paymentDto);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.receptionist)
  @ApiOperation({ summary: 'Update bill' })
  @ApiResponse({
    status: 200,
    description: 'Bill updated successfully',
    type: BillResponseDto
  })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async update(@Param('id') id: string, @Body() updateBillDto: UpdateBillDto) {
    return this.billingService.update(id, updateBillDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete bill' })
  @ApiResponse({ status: 204, description: 'Bill deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete bill with payments' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async remove(@Param('id') id: string) {
    await this.billingService.remove(id);
  }
}