import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@ApiTags('Medical Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.doctor)
  @ApiOperation({ summary: 'Create a new medical record' })
  @ApiResponse({
    status: 201,
    description: 'Medical record created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data provided',
  })
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(createMedicalRecordDto);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  @ApiOperation({ summary: 'Get all medical records with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'patientId', required: false, type: String, description: 'Filter by patient ID' })
  @ApiQuery({ name: 'doctorId', required: false, type: String, description: 'Filter by doctor ID' })
  @ApiQuery({ name: 'recordType', required: false, type: String, description: 'Filter by record type' })
  @ApiResponse({
    status: 200,
    description: 'Medical records retrieved successfully',
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('recordType') recordType?: string,
  ) {
    return this.medicalRecordsService.findAll(
      page || 1,
      limit || 10,
      patientId,
      doctorId,
      recordType
    );
  }

  @Get('patient/:patientId/history')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  @ApiOperation({ summary: 'Get patient medical history' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Patient medical history retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  getPatientHistory(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.medicalRecordsService.getPatientMedicalHistory(
      patientId,
      page || 1,
      limit || 10
    );
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  @ApiOperation({ summary: 'Get medical record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Medical record retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Medical record not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicalRecordsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.doctor)
  @ApiOperation({ summary: 'Update medical record' })
  @ApiResponse({
    status: 200,
    description: 'Medical record updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Medical record not found',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.update(id, updateMedicalRecordDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.doctor)
  @ApiOperation({ summary: 'Delete medical record (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Medical record deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Medical record not found',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicalRecordsService.remove(id);
  }
}