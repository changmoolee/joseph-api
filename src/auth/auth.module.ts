import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.entity';

@Module({
  // NestJS의 DI(의존성 주입, Dependency Injection)를 통해 UserRepository를 UserService에서 사용할 수 있도록 함
  /*
    NestJS에서 TypeORM을 사용할 때, Repository는 직접 new 키워드로 생성하지 않고, NestJS에서 자동으로 주입받아 사용해야 함
    forFeature([User])를 등록하지 않으면, UserRepository를 UserService에서 사용할 수 없음
  */
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
