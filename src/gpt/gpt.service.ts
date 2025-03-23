import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from 'src/post/post.entity';

@Injectable()
export class GptService {
  constructor(
    // UserRepository를 NestJS의 DI 시스템을 통해 주입받음
    @InjectRepository(Post)
    // TypeORM의 저장소 객체
    private postRepository: Repository<Post>,
  ) {}

  async generatePost(adminKey: string): Promise<string> {
    if (adminKey !== process.env.GENERATE_POST_API_KEY) {
      throw new UnauthorizedException('접근 권한이 없습니다.');
    }

    const users = [
      {
        id: 1,
        character: '이직을 준비중인 직업이 마케터인 30 40대 여성',
      },
      {
        id: 3,
        character: '애니메이션을 좋아하는 프로그래머인 30대 남성',
      },
      {
        id: 4,
        character: '여행을 좋아하는 30 40대 남성',
      },
    ];
    const randomIndex = Math.floor(Math.random() * users.length);
    const randomUser = users.at(randomIndex);

    const openAiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: `${randomUser.character}이 작성할 법한 인스타그램 게시글을 200자 이내로 작성해줘. message에는 #을 제외한 내용만 적고, keyword에는 이미지 키워드 1~2개만 넣어줘. 예시: {"message": "...", "keywords": ["sunset", "ocean"]} 반드시 예시와 같이 JSON형태로 응답해줘.`,
            },
          ],
          temperature: 0.8,
        }),
      },
    );

    const data = await openAiResponse.json();

    const resultText = data.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(resultText);
    } catch (error: any) {
      console.error('GPT 응답 파싱 실패:', resultText);
      throw new Error('GPT 응답이 올바른 JSON이 아닙니다.' + error);
    }

    const { message, keywords } = parsed;

    const unSplashResponse = await fetch(
      `${process.env.UNSPLASH_API_URL}?query=${keywords}`,
      {
        method: 'GET',
        headers: {
          Authorization: process.env.UNSPLASH_API_KEY,
        },
      },
    );

    const imageData = await unSplashResponse.json();

    const image_url = imageData?.results.at(0)?.urls.regular;

    if (!image_url) {
      throw new Error('unsplash api 호출에 실패하였습니다.');
    }

    await this.postRepository
      .createQueryBuilder('post')
      .insert()
      .into(Post)
      .values({
        user: { id: randomUser.id },
        image_url,
        description: message,
      })
      .execute();

    return data.choices[0].message.content;
  }
}
