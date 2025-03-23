import { Bookmark } from 'src/bookmark/bookmark.entity';
import { Like } from 'src/like/like.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  OneToMany,
  RelationId,
} from 'typeorm';

// 클래스(Post)를 MySQL의 posts 테이블과 연결
@Entity('posts')
export class Post {
  // id 필드가 자동 증가(Auto Increment) 되는 기본 키 설정
  @PrimaryGeneratedColumn()
  id: number;

  // created_at 필드는 유저 생성 시 자동으로 현재 날짜/시간이 저장됨 (DEFAULT CURRENT_TIMESTAMP)
  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 1024 })
  image_url: string;

  // 여러 개의 post가 하나의 user를 참조 (다 대 일 관계)
  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((post: Post) => post.user)
  user_id: number;

  // 하나의 post가 여러개의 likes를 참조 (다 대 일 관계)
  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  // 하나의 post가 여러개의 bookmark를 참조 (다 대 일 관계)
  @OneToMany(() => Bookmark, (bookmark) => bookmark.post)
  bookmarks: Bookmark[];
}
