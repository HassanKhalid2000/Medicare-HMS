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
  Request,
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { CreateTemplateInstanceDto } from './dto/create-template-instance.dto';
import { UpdateTemplateInstanceDto } from './dto/update-template-instance.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole, MedicalTemplateCategory, MedicalTemplateType, TemplateInstanceStatus } from '@prisma/client';

@Controller('templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // Template endpoints
  @Post()
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  create(@Body() createTemplateDto: CreateTemplateDto, @Request() req) {
    return this.templatesService.create(createTemplateDto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('category') category?: string,
    @Query('templateType') templateType?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('specialization') specialization?: string,
    @Query('createdBy') createdBy?: string,
  ) {
    return this.templatesService.findAll({
      page: page || 1,
      limit: limit || 10,
      category: category as MedicalTemplateCategory,
      templateType: templateType as MedicalTemplateType,
      isActive: isActive ? isActive === 'true' : undefined,
      search,
      specialization,
      createdBy,
    });
  }

  @Get('categories/:category')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  findByCategory(@Param('category', new ParseEnumPipe(MedicalTemplateCategory)) category: MedicalTemplateCategory) {
    return this.templatesService.getTemplatesByCategory(category);
  }

  @Get('system')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  findSystemTemplates() {
    return this.templatesService.getSystemTemplates();
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
    @Request() req
  ) {
    return this.templatesService.update(id, updateTemplateDto, req.user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.doctor)
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.templatesService.remove(id, req.user.sub);
  }

  // Template Instance endpoints
  @Post('instances')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  createInstance(@Body() createInstanceDto: CreateTemplateInstanceDto, @Request() req) {
    return this.templatesService.createInstance(createInstanceDto, req.user.sub);
  }

  @Get('instances')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  findAllInstances(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('patientId') patientId?: string,
    @Query('templateId') templateId?: string,
    @Query('status') status?: string,
    @Query('completedBy') completedBy?: string,
  ) {
    return this.templatesService.findAllInstances({
      page: page || 1,
      limit: limit || 10,
      patientId,
      templateId,
      status: status as TemplateInstanceStatus,
      completedBy,
    });
  }

  @Get('instances/:id')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  findOneInstance(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.findOneInstance(id);
  }

  @Patch('instances/:id')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  updateInstance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInstanceDto: UpdateTemplateInstanceDto,
    @Request() req
  ) {
    return this.templatesService.updateInstance(id, updateInstanceDto, req.user.sub);
  }

  @Delete('instances/:id')
  @Roles(UserRole.admin, UserRole.doctor, UserRole.nurse)
  removeInstance(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.removeInstance(id);
  }
}