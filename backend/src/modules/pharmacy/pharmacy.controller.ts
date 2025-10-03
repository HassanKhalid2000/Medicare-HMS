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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PharmacyService } from './pharmacy.service';
import { CreateMedicineDto, UpdateMedicineDto, MedicineQueryDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('pharmacy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new medicine to inventory' })
  create(@Body() createMedicineDto: CreateMedicineDto) {
    return this.pharmacyService.create(createMedicineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medicines with filtering and pagination' })
  findAll(@Query() query: MedicineQueryDto) {
    return this.pharmacyService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get pharmacy statistics' })
  getStatistics() {
    return this.pharmacyService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific medicine by ID' })
  findOne(@Param('id') id: string) {
    return this.pharmacyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update medicine information' })
  update(@Param('id') id: string, @Body() updateMedicineDto: UpdateMedicineDto) {
    return this.pharmacyService.update(id, updateMedicineDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a medicine from inventory' })
  remove(@Param('id') id: string) {
    return this.pharmacyService.remove(id);
  }

  @Patch(':id/adjust-stock')
  @ApiOperation({ summary: 'Adjust medicine stock quantity' })
  adjustStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.pharmacyService.adjustStock(id, quantity);
  }
}
