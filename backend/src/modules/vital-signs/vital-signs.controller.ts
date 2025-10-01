import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VitalSignsService } from './vital-signs.service';
import { CreateVitalSignDto, UpdateVitalSignDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { VitalSignType } from '@prisma/client';

@ApiTags('vital-signs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vital-signs')
export class VitalSignsController {
  constructor(private readonly vitalSignsService: VitalSignsService) {}

  @Post()
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Record new vital signs' })
  @ApiResponse({ status: 201, description: 'Vital signs recorded successfully' })
  create(@Body() createVitalSignDto: CreateVitalSignDto) {
    return this.vitalSignsService.create(createVitalSignDto);
  }

  @Get()
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'Get all vital signs with optional filters' })
  findAll(
    @Query('patientId') patientId?: string,
    @Query('type') type?: VitalSignType,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.vitalSignsService.findAll(patientId, type, limitNum);
  }

  @Get('statistics')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Get vital signs statistics' })
  getStatistics(
    @Query('patientId') patientId?: string,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.vitalSignsService.getVitalSignsStatistics(patientId, daysNum);
  }

  @Get('abnormal')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Get abnormal vital signs' })
  getAbnormalVitalSigns(
    @Query('patientId') patientId?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.vitalSignsService.getAbnormalVitalSigns(patientId, limitNum);
  }

  @Get('patient/:patientId/latest')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'Get latest vital signs for a patient' })
  getLatestVitalSigns(@Param('patientId') patientId: string) {
    return this.vitalSignsService.getLatestVitalSigns(patientId);
  }

  @Get('patient/:patientId/history')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'Get vital signs history for a patient' })
  getPatientVitalHistory(
    @Param('patientId') patientId: string,
    @Query('type') type?: VitalSignType,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : undefined;
    return this.vitalSignsService.getPatientVitalHistory(patientId, type, daysNum);
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'Get vital sign by ID' })
  findOne(@Param('id') id: string) {
    return this.vitalSignsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Update vital sign' })
  update(@Param('id') id: string, @Body() updateVitalSignDto: UpdateVitalSignDto) {
    return this.vitalSignsService.update(id, updateVitalSignDto);
  }

  @Delete(':id')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Delete vital sign' })
  remove(@Param('id') id: string) {
    return this.vitalSignsService.remove(id);
  }
}