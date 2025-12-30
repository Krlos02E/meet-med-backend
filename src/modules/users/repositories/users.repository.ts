import { Injectable } from '@nestjs/common';
import { DataSource, Repository, EntityManager } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  private repository: Repository<User>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(User);
  }

  private getRepository(manager?: EntityManager): Repository<User> {
    return manager ? manager.getRepository(User) : this.repository;
  }

  async save(user: Partial<User>, manager?: EntityManager): Promise<User> {
    return await this.getRepository(manager).save(user);
  }

  async findByEmail(email: string, manager?: EntityManager): Promise<User | null> {
    return await this.getRepository(manager).findOne({
      where: { email, isDeleted: false },
      select: ['id', 'email', 'password', 'role', 'isDeleted'],
    });
  }

  async findById(id: string, manager?: EntityManager): Promise<User | null> {
    return await this.getRepository(manager).findOne({
      where: { id, isDeleted: false },
    });
  }

  async update(id: string, user: Partial<User>, manager?: EntityManager): Promise<void> {
    await this.getRepository(manager).update(id, user);
  }
}
