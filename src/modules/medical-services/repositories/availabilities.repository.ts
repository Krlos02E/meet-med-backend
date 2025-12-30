import { Injectable } from '@nestjs/common';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { Availability } from '../entities/availability.entity';

@Injectable()
export class AvailabilitiesRepository {
  private repository: Repository<Availability>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Availability);
  }

  private getRepository(manager?: EntityManager): Repository<Availability> {
    return manager ? manager.getRepository(Availability) : this.repository;
  }

  async saveMany(availabilities: Partial<Availability>[], manager?: EntityManager): Promise<Availability[]> {
    return await this.getRepository(manager).save(availabilities);
  }

  async deleteByServiceId(serviceId: string, manager?: EntityManager): Promise<void> {
    await this.getRepository(manager).delete({ medicalService: { id: serviceId } });
  }
}
