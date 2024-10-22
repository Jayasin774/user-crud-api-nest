import { UpdateUserDto } from "src/core/dto/users.dto";
import { User } from "../entities/user.entity";


export interface UserRepositoryPort {
  create(user: User): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User>;
  update(id: number, user: UpdateUserDto): Promise<User>;
  delete(id: number): Promise<void>;
  findOneByField(field: keyof User, value: string): Promise<User | undefined>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
