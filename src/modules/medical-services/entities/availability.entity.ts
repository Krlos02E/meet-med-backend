import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MedicalService } from './medical-service.entity';

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  dateTime: Date;

  @ManyToOne(() => MedicalService, (service) => service.availabilities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'medical_service_id' })
  medicalService: MedicalService;
}
