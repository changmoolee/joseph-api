import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';

// 클래스(Post)를 MySQL의 posts 테이블과 연결
@Entity('posts')
export class Post {
  // id 필드가 자동 증가(Auto Increment) 되는 기본 키 설정
  @PrimaryGeneratedColumn()
  id: number;

  // 중복되지 않도록 UNIQUE 제약 조건 추가
  @Column()
  user_id: string;

  // 여러 개의 post가 하나의 user를 참조 (다 대 일 관계)
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // created_at 필드는 유저 생성 시 자동으로 현재 날짜/시간이 저장됨 (DEFAULT CURRENT_TIMESTAMP)
  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 255 })
  image_url: string;
}
