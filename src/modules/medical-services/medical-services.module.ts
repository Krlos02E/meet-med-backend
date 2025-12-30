import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalServicesService } from './medical-services.service';
import { MedicalServicesController } from './medical-services.controller';
import { MedicalService } from './entities/medical-service.entity';
import { Availability } from './entities/availability.entity';
import { MedicalServicesRepository } from './repositories/medical-services.repository';
import { AvailabilitiesRepository } from './repositories/availabilities.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalService, Availability])],
  controllers: [MedicalServicesController],
  providers: [
    MedicalServicesService,
    MedicalServicesRepository,
    AvailabilitiesRepository,
  ],
})
export class MedicalServicesModule {}
