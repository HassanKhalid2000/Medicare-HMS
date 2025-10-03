import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LaboratoryService } from './laboratory.service';
import { CreateLabTestDto, UpdateLabTestDto, LabTestQueryDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('laboratory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('laboratory')
export class LaboratoryController {
  constructor(private readonly laboratoryService: LaboratoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lab test order' })
  @ApiResponse({ status: 201, description: 'Lab test created successfully' })
  @ApiResponse({ status: 404, description: 'Patient or Doctor not found' })
  create(@Body() createLabTestDto: CreateLabTestDto) {
    return this.laboratoryService.create(createLabTestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lab tests with filtering' })
  @ApiResponse({ status: 200, description: 'Lab tests retrieved successfully' })
  findAll(@Query() query: LabTestQueryDto) {
    return this.laboratoryService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get laboratory statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics() {
    return this.laboratoryService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific lab test by ID' })
  @ApiResponse({ status: 200, description: 'Lab test retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lab test not found' })
  findOne(@Param('id') id: string) {
    return this.laboratoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lab test' })
  @ApiResponse({ status: 200, description: 'Lab test updated successfully' })
  @ApiResponse({ status: 404, description: 'Lab test not found' })
  update(@Param('id') id: string, @Body() updateLabTestDto: UpdateLabTestDto) {
    return this.laboratoryService.update(id, updateLabTestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lab test' })
  @ApiResponse({ status: 200, description: 'Lab test deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lab test not found' })
  remove(@Param('id') id: string) {
    return this.laboratoryService.remove(id);
  }
}
