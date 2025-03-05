import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  RelationId,
} from 'typeorm';

// 클래스(Bookmark)를 MySQL의 bookmarks 테이블과 연결
@Entity('bookmarks')
export class Bookmark {
  // id 필드가 자동 증가(Auto Increment) 되는 기본 키 설정
  @PrimaryGeneratedColumn()
  id: number;

  // created_at 필드는 좋아요 생성시 자동으로 현재 날짜/시간이 저장됨 (DEFAULT CURRENT_TIMESTAMP)
  @CreateDateColumn()
  created_at: Date;

  // 한명의 유저가 여러 개의 좋아요 할수 있음
  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((like: Bookmark) => like.user) // you need to specify target relation
  user_id: number;

  // 한개의 게시물이 여러 개의 좋아요 가질 수 있음
  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @RelationId((like: Bookmark) => like.post) // you need to specify target relation
  post_id: number;
}
