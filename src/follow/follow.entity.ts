import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  RelationId,
} from 'typeorm';

// 클래스(Like)를 MySQL의 likes 테이블과 연결
@Entity('follows')
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  // 특정 회원을 팔로우 하는 회원
  @ManyToOne(() => User, (user) => user.followings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  @RelationId((follow: Follow) => follow.follower)
  follower_id: number;

  // 팔로잉 당하는 특정 회원
  @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following: User;

  @RelationId((follow: Follow) => follow.following)
  following_id: number;
}
