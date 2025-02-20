import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    // UserRepository를 NestJS의 DI 시스템을 통해 주입받음
    @InjectRepository(User)
    // TypeORM의 저장소 객체
    // User 엔티티의 데이터베이스 조작을 위한 Repository
    private userRepository: Repository<User>,
  ) {}

  async signupUser(userDto: CreateUserDto) {
    // cost 10
    const saltRounds = 10;

    /** 해싱처리한 패스워드 */
    const hashedPassword = await bcrypt.hash(userDto.password, saltRounds);

    // https://typeorm.io/insert-query-builder
    await this.userRepository
      .createQueryBuilder('user')
      .insert()
      .into(User)
      .values({
        ...userDto,
        password: hashedPassword,
      })
      .execute();

    return this.userRepository.find();
  }
}
