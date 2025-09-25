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
import { PrescriptionsService, Medicine, DrugInteraction } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.doctor)
  create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(createPrescriptionDto);
  }

  @Post('check-interactions')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  checkDrugInteractions(@Body() body: { medicineIds: string[] }): Promise<DrugInteraction[]> {
    return this.prescriptionsService.checkDrugInteractions(body.medicineIds);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('patientId') patientId?: string,
    @Query('medicalRecordId') medicalRecordId?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ): Promise<any> {
    return this.prescriptionsService.findAll({
      page: page || 1,
      limit: limit || 10,
      patientId,
      medicalRecordId,
      isActive: isActive ? isActive === 'true' : undefined,
      search,
    });
  }

  @Get('medical-record/:medicalRecordId')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  findByMedicalRecord(@Param('medicalRecordId', ParseUUIDPipe) medicalRecordId: string): Promise<any[]> {
    return this.prescriptionsService.findByMedicalRecord(medicalRecordId);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  findByPatient(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('isActive') isActive?: string,
  ): Promise<any> {
    return this.prescriptionsService.findByPatient(patientId, {
      page: page || 1,
      limit: limit || 10,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get('medicines/search')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  searchMedicines(
    @Query('query') query: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<Medicine[]> {
    return this.prescriptionsService.searchMedicines(query, limit || 20);
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.doctor)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto
  ) {
    return this.prescriptionsService.update(id, updatePrescriptionDto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.admin, UserRole.doctor)
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.prescriptionsService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.admin, UserRole.doctor)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.prescriptionsService.deactivate(id);
  }

  @Patch(':id/dispense')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  dispense(@Param('id', ParseUUIDPipe) id: string) {
    return this.prescriptionsService.dispensePrescription(id);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.doctor)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.prescriptionsService.remove(id);
  }
}