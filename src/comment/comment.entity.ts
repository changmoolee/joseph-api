import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  RelationId,
  UpdateDateColumn,
  Column,
} from 'typeorm';

// 클래스(Comment)를 MySQL의 comments 테이블과 연결
@Entity('comments')
export class Comment {
  // id 필드가 자동 증가(Auto Increment) 되는 기본 키 설정
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  // created_at 필드는 댓글 생성시 자동으로 현재 날짜/시간이 저장됨 (DEFAULT CURRENT_TIMESTAMP)
  @CreateDateColumn()
  created_at: Date;

  // updated_at 필드는 댓글 수정시 자동으로 현재 날짜/시간이 저장됨
  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @Column({ type: 'int', nullable: true })
  parent_comment_id: number | null;

  // 한명의 유저가 여러 개의 댓글을 만들 수 있음
  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((like: Comment) => like.user)
  user_id: number;

  // 한개의 게시물이 여러 개의 댓글이 달릴 수 있음
  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @RelationId((like: Comment) => like.post)
  post_id: number;
}
