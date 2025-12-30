import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { MedicalServicesService } from './medical-services.service';
import { CreateMedicalServiceDto } from './dto/create-medical-service.dto';
import { UpdateMedicalServiceDto } from './dto/update-medical-service.dto';
import { SearchMedicalServiceDto } from './dto/search-medical-service.dto';
import { MedicalServiceResponseDto } from './dto/medical-service-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { plainToInstance } from 'class-transformer';

@ApiTags('medical-services')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medical-services')
export class MedicalServicesController {
  constructor(private readonly medicalServicesService: MedicalServicesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a medical service (ADMIN only)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: MedicalServiceResponseDto })
  async create(@Body() createDto: CreateMedicalServiceDto) {
    const service = await this.medicalServicesService.create(createDto);
    return plainToInstance(MedicalServiceResponseDto, service);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medical services with filters and pagination' })
  @ApiResponse({ status: HttpStatus.OK, type: [MedicalServiceResponseDto] })
  async findAll(
    @Query() query: SearchMedicalServiceDto,
    @GetUser('role') role: UserRole,
  ) {
    const result = await this.medicalServicesService.findAll(query, role);
    return {
      ...result,
      items: plainToInstance(MedicalServiceResponseDto, result.items),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a medical service by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: MedicalServiceResponseDto })
  async findOne(@Param('id') id: string) {
    const service = await this.medicalServicesService.findOne(id);
    return plainToInstance(MedicalServiceResponseDto, service);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a medical service (ADMIN only)' })
  @ApiResponse({ status: HttpStatus.OK, type: MedicalServiceResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMedicalServiceDto,
  ) {
    const service = await this.medicalServicesService.update(id, updateDto);
    return plainToInstance(MedicalServiceResponseDto, service);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Logical delete of a medical service (ADMIN only)' })
  async remove(@Param('id') id: string) {
    await this.medicalServicesService.remove(id);
    return { message: 'Medical service deleted successfully' };
  }
}
