import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './infrastructure/http-server/controllers/user.controller';
import { UserRepository } from './infrastructure/adapters/user.repository.adapter';
import { UserEntity } from './infrastructure/users-database/entities/user.entity';
import { UserService } from './core/domain/services/user.service';
import { USER_REPOSITORY } from './core/domain/ports/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { AuthMiddleware } from './infrastructure/http-server/middleware/auth.middleware';
import { JwtStrategy } from './core/auth/jwt.strategy';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [UserEntity],
      synchronize: true,
    }),

    TypeOrmModule.forFeature([UserEntity]),

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    UserService,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'users', method: RequestMethod.POST },
        { path: 'users/login', method: RequestMethod.POST }
      ).forRoutes(
        { path: 'users', method: RequestMethod.GET },
        { path: 'users/:id', method: RequestMethod.GET },
        { path: 'users/:id', method: RequestMethod.PUT },
        { path: 'users/:id', method: RequestMethod.DELETE }
      );
  }
}
