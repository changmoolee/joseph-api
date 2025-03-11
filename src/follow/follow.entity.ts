import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

// 클래스(Like)를 MySQL의 likes 테이블과 연결
@Entity('follows')
export class Follow {
  // id 필드가 자동 증가(Auto Increment) 되는 기본 키 설정
  @PrimaryGeneratedColumn()
  id: number;

  // created_at 필드는 좋아요 생성시 자동으로 현재 날짜/시간이 저장됨 (DEFAULT CURRENT_TIMESTAMP)
  @CreateDateColumn()
  created_at: Date;

  // 팔로우 하는 회원
  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  // 팔로잉 당하는 회원
  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following: User;
}
