import { Bookmark } from 'src/bookmark/bookmark.entity';
import { Like } from 'src/like/like.entity';
import { Post } from 'src/post/post.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';

// 클래스(User)를 MySQL의 users 테이블과 연결
@Entity('users')
export class User {
  // id 필드가 자동 증가(Auto Increment) 되는 기본 키 설정
  @PrimaryGeneratedColumn()
  id: number;

  // username과 email은 중복되지 않도록 UNIQUE 제약 조건 추가
  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true }) // 추후 더미데이터 삭제시 수정 필요
  password: string;

  @Column({ nullable: true })
  image_url: string;

  // created_at 필드는 유저 생성 시 자동으로 현재 날짜/시간이 저장됨 (DEFAULT CURRENT_TIMESTAMP)
  @CreateDateColumn()
  created_at: Date;

  // deleted_at 필드는 유저 탈퇴(소프트 삭제)시 생성된다. 해당 필드가 채워져 있으면 각 검색 쿼리에서 제외된다.
  @DeleteDateColumn()
  deleted_at: Date;

  // 한 명의 user가 여러 개의 posts를 가질 수 있음 (일 대 다 관계)
  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  // 한 명의 user가 여러 개의 like를 가질 수 있음 (일 대 다 관계)
  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  // 한 명의 user가 여러 개의 bookmark를 설정할 수 있음 (일 대 다 관계)
  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks: Bookmark[];
}
