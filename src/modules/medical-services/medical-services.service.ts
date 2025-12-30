import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MedicalServicesRepository } from './repositories/medical-services.repository';
import { AvailabilitiesRepository } from './repositories/availabilities.repository';
import { MedicalService } from './entities/medical-service.entity';
import { CreateMedicalServiceDto } from './dto/create-medical-service.dto';
import { UpdateMedicalServiceDto } from './dto/update-medical-service.dto';
import { SearchMedicalServiceDto } from './dto/search-medical-service.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class MedicalServicesService {
  constructor(
    private readonly medicalServicesRepository: MedicalServicesRepository,
    private readonly availabilitiesRepository: AvailabilitiesRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreateMedicalServiceDto): Promise<MedicalService> {
    return await this.dataSource.transaction(async (manager) => {
      const medicalService = await this.medicalServicesRepository.save({
        name: createDto.name,
        description: createDto.description,
        price: createDto.price,
      }, manager);

      if (createDto.availabilities && createDto.availabilities.length > 0) {
        const availabilities = createDto.availabilities.map((a) => ({
          dateTime: new Date(a.dateTime),
          medicalService: medicalService,
        }));
        await this.availabilitiesRepository.saveMany(availabilities, manager);
      }

      const createdService = await this.medicalServicesRepository.findById(medicalService.id, manager);
      if (!createdService) {
        throw new NotFoundException(`Medical Service with ID ${medicalService.id} not found after creation`);
      }
      return createdService;
    });
  }

  async findAll(query: SearchMedicalServiceDto, userRole: UserRole) {
    const [items, total] = await this.medicalServicesRepository.findAllWithFilters(query, userRole);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<MedicalService> {
    const service = await this.medicalServicesRepository.findById(id);
    if (!service) {
      throw new NotFoundException(`Medical Service with ID ${id} not found`);
    }
    return service;
  }

  async update(id: string, updateDto: UpdateMedicalServiceDto): Promise<MedicalService> {
    return await this.dataSource.transaction(async (manager) => {
      const service = await this.medicalServicesRepository.findById(id, manager);
      if (!service) {
        throw new NotFoundException(`Medical Service with ID ${id} not found`);
      }

      const updateData: Partial<MedicalService> = {};
      if (updateDto.name) updateData.name = updateDto.name;
      if (updateDto.description) updateData.description = updateDto.description;
      if (updateDto.price) updateData.price = updateDto.price;

      if (Object.keys(updateData).length > 0) {
        await this.medicalServicesRepository.update(id, updateData, manager);
      }

      if (updateDto.availabilities) {
        await this.availabilitiesRepository.deleteByServiceId(id, manager);
        const newAvailabilities = updateDto.availabilities.map((a) => ({
          dateTime: new Date(a.dateTime),
          medicalService: service,
        }));
        await this.availabilitiesRepository.saveMany(newAvailabilities, manager);
      }

      const updatedService = await this.medicalServicesRepository.findById(id, manager);
      if (!updatedService) {
        throw new NotFoundException(`Medical Service with ID ${id} not found after update`);
      }
      return updatedService;
    });
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);
    await this.medicalServicesRepository.softDelete(id);
  }
}
