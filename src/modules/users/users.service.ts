import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityManager } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto, manager?: EntityManager): Promise<User> {
    return await this.usersRepository.save(createUserDto, manager);
  }

  async findOneByEmail(email: string, manager?: EntityManager): Promise<User | null> {
    return await this.usersRepository.findByEmail(email, manager);
  }

  async findOneById(id: string, manager?: EntityManager): Promise<User | null> {
    return await this.usersRepository.findById(id, manager);
  }

  async update(id: string, updateUserDto: UpdateUserDto, manager?: EntityManager): Promise<User> {
    const user = await this.findOneById(id, manager);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersRepository.update(id, updateUserDto, manager);
    const updatedUser = await this.findOneById(id, manager);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found after update`);
    }
    return updatedUser;
  }

  async remove(id: string, manager?: EntityManager): Promise<void> {
    const user = await this.findOneById(id, manager);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersRepository.update(id, { isDeleted: true }, manager);
  }
}
