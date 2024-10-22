import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './infrastructure/http-server/controllers/user.controller';
import { UserRepository } from './infrastructure/adapters/user.repository.adapter';
import { UserEntity } from './infrastructure/users-database/entities/user.entity';
import { UserService } from './core/domain/services/user.service';
import { USER_REPOSITORY } from './core/domain/ports/user.repository';
// import { USER_REPOSITORY } from './core/ports/user.repository.token';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'root',
      database: 'users',
      entities: [UserEntity],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
})
export class AppModule { }
