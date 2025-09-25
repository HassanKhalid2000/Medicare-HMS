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
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DiagnosesService } from './diagnoses.service';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('diagnoses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiagnosesController {
  constructor(private readonly diagnosesService: DiagnosesService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.doctor)
  create(@Body() createDiagnosisDto: CreateDiagnosisDto) {
    return this.diagnosesService.create(createDiagnosisDto);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('patientId') patientId?: string,
    @Query('medicalRecordId') medicalRecordId?: string,
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    return this.diagnosesService.findAll({
      page: page || 1,
      limit: limit || 10,
      patientId,
      medicalRecordId,
      type,
      isActive: isActive ? isActive === 'true' : undefined,
      search,
    });
  }

  @Get('medical-record/:medicalRecordId')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  findByMedicalRecord(@Param('medicalRecordId', ParseUUIDPipe) medicalRecordId: string) {
    return this.diagnosesService.findByMedicalRecord(medicalRecordId);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.diagnosesService.findByPatient(patientId, {
      page: page || 1,
      limit: limit || 10,
      type,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get('icd10/search')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  searchICD10(
    @Query('query') query: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.diagnosesService.searchICD10Codes(query, limit || 20);
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.diagnosesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.doctor)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDiagnosisDto: UpdateDiagnosisDto
  ) {
    return this.diagnosesService.update(id, updateDiagnosisDto);
  }

  @Patch(':id/resolve')
  @Roles(UserRole.admin, UserRole.doctor)
  resolve(@Param('id', ParseUUIDPipe) id: string) {
    return this.diagnosesService.resolve(id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.admin, UserRole.doctor)
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.diagnosesService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.admin, UserRole.doctor)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.diagnosesService.deactivate(id);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.doctor)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.diagnosesService.remove(id);
  }
}