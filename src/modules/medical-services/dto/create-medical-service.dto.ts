import { IsString, IsNotEmpty, IsNumber, IsArray, IsDateString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AvailabilityDto {
  @ApiProperty({ example: '2025-12-12T14:30:00Z' })
  @IsDateString()
  dateTime: string;
}

export class CreateMedicalServiceDto {
  @ApiProperty({ example: 'General Consultation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Standard medical checkup', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  price: number;

  @ApiProperty({ type: [AvailabilityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityDto)
  availabilities: AvailabilityDto[];
}
