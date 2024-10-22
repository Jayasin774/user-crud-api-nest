import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepositoryPort, USER_REPOSITORY } from '../ports/user.repository';
import { User } from "../entities/user.entity";
import { plainToClass } from 'class-transformer';
import { UserEntity } from 'src/infrastructure/users-database/entities/user.entity';
import { UpdateUserDto } from 'src/core/dto/users.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepositoryPort,
  ) { }

  async createUser(user: User): Promise<User> {
    return this.userRepository.create(user);
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await this.userRepository.findAll();
      return plainToClass(UserEntity, users);
    } catch (error) {
      throw error
    }
  }

  async getUserById(id: number): Promise<User> {
    return this.userRepository.findById(id);
  }

  async updateUser(id: number, user: UpdateUserDto): Promise<User> {
    return this.userRepository.update(id, user);
  }

  async deleteUser(id: number): Promise<void> {
    return this.userRepository.delete(id);
  }

  async getEmailByUser(email: string): Promise<any> {
    return this.userRepository.findOneByField('email', email);
  }
}
