import { Injectable } from '@nestjs/common';
import { DataSource, Repository, EntityManager, SelectQueryBuilder } from 'typeorm';
import { MedicalService } from '../entities/medical-service.entity';
import { SearchMedicalServiceDto } from '../dto/search-medical-service.dto';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class MedicalServicesRepository {
  private repository: Repository<MedicalService>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(MedicalService);
  }

  private getRepository(manager?: EntityManager): Repository<MedicalService> {
    return manager ? manager.getRepository(MedicalService) : this.repository;
  }

  async save(service: Partial<MedicalService>, manager?: EntityManager): Promise<MedicalService> {
    return await this.getRepository(manager).save(service);
  }

  async findById(id: string, manager?: EntityManager): Promise<MedicalService | null> {
    return await this.getRepository(manager).findOne({
      where: { id, isDeleted: false },
      relations: ['availabilities'],
    });
  }

  async findAllWithFilters(
    query: SearchMedicalServiceDto,
    userRole: UserRole,
    manager?: EntityManager,
  ): Promise<[MedicalService[], number]> {
    const { page = 1, limit = 10, startDate, endDate, includeDeleted } = query;
    const repo = this.getRepository(manager);
    
    const queryBuilder = repo.createQueryBuilder('service')
      .leftJoinAndSelect('service.availabilities', 'availability')
      .skip((page - 1) * limit)
      .take(limit);

    if (!includeDeleted || userRole !== UserRole.ADMIN) {
      queryBuilder.andWhere('service.isDeleted = :isDeleted', { isDeleted: false });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('availability.dateTime BETWEEN :start AND :end', {
        start: new Date(startDate),
        end: new Date(endDate),
      });
    }

    return await queryBuilder.getManyAndCount();
  }

  async update(id: string, service: Partial<MedicalService>, manager?: EntityManager): Promise<void> {
    await this.getRepository(manager).update(id, service);
  }

  async softDelete(id: string, manager?: EntityManager): Promise<void> {
    await this.getRepository(manager).update(id, { isDeleted: true });
  }
}
