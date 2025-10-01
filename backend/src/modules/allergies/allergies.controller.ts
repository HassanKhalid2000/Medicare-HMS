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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AllergiesService } from './allergies.service';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';
import { AllergyQueryDto } from './dto/allergy-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Allergies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('allergies')
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  @Post()
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Create a new allergy record' })
  @ApiResponse({ status: 201, description: 'Allergy record created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  create(@Body() createAllergyDto: CreateAllergyDto) {
    return this.allergiesService.create(createAllergyDto);
  }

  @Get()
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'Get all allergy records with filters' })
  @ApiResponse({ status: 200, description: 'List of allergy records' })
  findAll(@Query() query: AllergyQueryDto) {
    return this.allergiesService.findAll(query);
  }

  @Get('patient/:patientId')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'Get active allergies for a specific patient' })
  @ApiResponse({ status: 200, description: 'Patient allergies retrieved' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.allergiesService.findByPatient(patientId);
  }

  @Get('check-drug/:patientId/:drugName')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Check if patient has allergy to a specific drug' })
  @ApiResponse({ status: 200, description: 'Drug allergy check result' })
  checkDrugAllergy(
    @Param('patientId') patientId: string,
    @Param('drugName') drugName: string,
  ) {
    return this.allergiesService.checkDrugAllergy(patientId, drugName);
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'Get a specific allergy record' })
  @ApiResponse({ status: 200, description: 'Allergy record retrieved' })
  @ApiResponse({ status: 404, description: 'Allergy record not found' })
  findOne(@Param('id') id: string) {
    return this.allergiesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Update an allergy record' })
  @ApiResponse({ status: 200, description: 'Allergy record updated' })
  @ApiResponse({ status: 404, description: 'Allergy record not found' })
  update(@Param('id') id: string, @Body() updateAllergyDto: UpdateAllergyDto) {
    return this.allergiesService.update(id, updateAllergyDto);
  }

  @Patch(':id/deactivate')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Deactivate an allergy record' })
  @ApiResponse({ status: 200, description: 'Allergy record deactivated' })
  @ApiResponse({ status: 404, description: 'Allergy record not found' })
  deactivate(@Param('id') id: string) {
    return this.allergiesService.deactivate(id);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an allergy record' })
  @ApiResponse({ status: 204, description: 'Allergy record deleted' })
  @ApiResponse({ status: 404, description: 'Allergy record not found' })
  remove(@Param('id') id: string) {
    return this.allergiesService.remove(id);
  }
}
