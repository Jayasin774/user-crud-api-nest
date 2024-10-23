import { Controller, Get, Post, Body, Param, Delete, Put, UsePipes, ValidationPipe, BadRequestException, NotFoundException, UnauthorizedException, Request } from '@nestjs/common';
import { UserService } from '../../../core/domain/services/user.service';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from 'src/core/dto/users.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  private generateToken(userId: number, email: string): string {
    return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Body() user: LoginUserDto): Promise<any> {
    const existingUser = await this.userService.getEmailByUser(user.email);
    if (!existingUser) {
      throw new NotFoundException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(user.password, existingUser.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(existingUser.id, existingUser.email);
    return {
      type: 'success',
      token: token,
      statusCode: 200,
    };
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createUser(@Body() user: CreateUserDto): Promise<any> {
    const existingUser = await this.userService.getEmailByUser(user.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;

    const data = await this.userService.createUser(user);
    delete data?.password;

    const token = this.generateToken(data.id, data.email);

    return {
      type: "success",
      data: data,
      token: token,
      statusCode: 200,
    };
  }

  @Get()
  async getAllUsers(@Request() req: any): Promise<any> {
    const userIdFromToken = req.user.userId;
    const user = await this.userService.getUserById(userIdFromToken);
    if (!user) {
      throw new UnauthorizedException('You are not authorized to view this user');
    }

    const data = await this.userService.getAllUsers();
    return {
      type: "success",
      data: data,
      statusCode: 200,
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: number, @Request() req: any): Promise<any> {
    if (!id) {
      throw new BadRequestException('Id must be provided.');
    }

    const userIdFromToken = req.user.userId;
    if (userIdFromToken !== id) {
      throw new UnauthorizedException('You are not authorized to view this user');
    }

    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    delete user?.password;
    return {
      type: "success",
      data: user,
      statusCode: 200,
    };
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateUser(@Param('id') id: number, @Body() user: UpdateUserDto, @Request() req: any): Promise<any> {
    if (!id) {
      throw new BadRequestException('Id must be provided.');
    }

    const userIdFromToken = req.user.userId;
    if (userIdFromToken !== id) {
      throw new UnauthorizedException('You are not authorized to update this user');
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

    const updatedUser = await this.userService.updateUser(id, user);
    delete updatedUser?.password;

    return {
      type: "success",
      data: updatedUser,
      statusCode: 200,
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number, @Request() req: any): Promise<any> {
    if (!id) {
      throw new BadRequestException('Id must be provided.');
    }

    const userIdFromToken = req.user.userId;
    if (userIdFromToken !== id) {
      throw new UnauthorizedException('You are not authorized to delete this user');
    }

    const existingUser = await this.userService.getUserById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userService.deleteUser(id);
    return {
      type: "success",
      data: "User successfully deleted.",
      statusCode: 200,
    };
  }
}