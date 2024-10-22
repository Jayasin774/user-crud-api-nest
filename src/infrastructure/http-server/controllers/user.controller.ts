import { Controller, Get, Post, Body, Param, Delete, Put, UsePipes, ValidationPipe, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from '../../../core/domain/services/user.service';
import { CreateUserDto, UpdateUserDto } from 'src/core/dto/users.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createUser(@Body() user: CreateUserDto): Promise<any> {
    const existingUser = await this.userService.getEmailByUser(user.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const data = await this.userService.createUser(user);
    delete data?.password;
    return {
      type: "success",
      data: data,
      statusCode: 200
    }
  }

  @Get()
  async getAllUsers(): Promise<any> {
    const data = await this.userService.getAllUsers();
    return {
      type: "success",
      data: data,
      statusCode: 200
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<any> {
    if (!id) {
      throw new BadRequestException('Id must be provided.');
    }
    const user = await this.userService.getUserById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    delete user?.password;
    return {
      type: "success",
      data: user,
      statusCode: 200
    }
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateUser(@Param('id') id: number, @Body() user: UpdateUserDto): Promise<any> {

    if (!id) {
      throw new BadRequestException('Id must be provided.');
    }

    const existingUser = await this.userService.getUserById(id);

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.email && user.email !== existingUser.email) {
      const userWithSameEmail = await this.userService.getEmailByUser(user.email);

      if (userWithSameEmail && userWithSameEmail.id !== id) {
        throw new BadRequestException('Email is already in use by another user');
      }
    }

    const updateUser = await this.userService.updateUser(id, user);
    delete updateUser?.password;

    return {
      type: "success",
      data: updateUser,
      statusCode: 200
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<any> {
    await this.userService.deleteUser(id);
    return {
      type: "success",
      data: "User successfully deleted.",
      statusCode: 200
    }
  }
}