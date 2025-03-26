# joseph-api

<br>

🚀 **배포 URL:**

**백엔드 (NestJS) →** [🌐 joseph-backend.site](https://joseph-backend.site)

- GitHub 레포지토리: [📂 joseph-api](https://github.com/changmoolee/joseph-api)
- Swagger Api 문서: [☘️ swagger](https://joseph-backend.site/api)

**프론트엔드 (Next.js) →** [🌍 joseph-instagram.vercel.app](https://joseph-instagram.vercel.app/)

- GitHub 레포지토리: [📂 joseph-instagram](https://github.com/changmoolee/joseph-instagram)

<br>

#### \*\* 현재 애플리케이션은 개발중입니다.

#### 버그 및 에러가 있을 수 있으며, 개발되지 않은 기능이 존재합니다. \*\*

<br><br>

## 개요

#### `joseph-api`은 NestJS 기반으로 제작되었으며 joseph-instagram 의 백엔드 기능을 제공합니다.<br>

#### 이 프로젝트는 프론트엔드 개발자로서 백엔드 및 데이터베이스까지 포함한 전체적인 웹 애플리케이션 개발 경험을 쌓기 위해 시작한 Instagram 클론 프로젝트입니다.

<br><br>

## Tech Stack

### 📌 **백엔드**

<img src="https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=NestJS&logoColor=white"/></a>
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white"/></a>
<img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=Node.js&logoColor=white"/></a>

### 📌 **인프라 & 배포**

<img src="https://img.shields.io/badge/AWS EC2-FF9900?style=flat-square&logo=Amazon EC2&logoColor=white"/></a>
<img src="https://img.shields.io/badge/AWS S3-569A31?style=flat-square&logo=Amazon S3&logoColor=white"/></a>

### 📌 **데이터베이스 & ORM**

<img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=MySQL&logoColor=white"/></a>
<img src="https://img.shields.io/badge/TypeORM-FF5733?style=flat-square&logo=typeorm&logoColor=white"/></a>
<img src="https://img.shields.io/badge/AWS S3-569A31?style=flat-square&logo=Amazon S3&logoColor=white"/></a>

### 📌 **보안 & 인증**

<img src="https://img.shields.io/badge/JWT-black?style=flat-square&logo=jsonwebtokens&logoColor=white"/></a>
<img src="https://img.shields.io/badge/bcrypt-aaaaaa?style=flat-square&logo=security&logoColor=white"/></a>

### 📌 **AI / 외부 API 연동**

<div>
<img src="https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white"/>
<img src="https://img.shields.io/badge/Unsplash-000000?style=flat-square&logo=Unsplash&logoColor=white"/>
</div>

<br><br>

## 📌 기능

### 주요 기능

1. **사용자 인증** <br>
   - 회원가입, 로그인 (JWT 기반 인증)<br>
   - 비밀번호 암호화 (bcrypt)<br>
   - 사용자 정보 조회 및 수정<br><br>
2. **게시글 관리** <br>
   - 게시글 생성, 수정, 삭제<br>
   - 게시글 목록 조회 (전체 / 특정 사용자)<br>
   - 이미지 업로드<br><br>
3. **좋아요 기능** <br>
   - 게시물 좋아요 / 좋아요 취소<br>
   - 좋아요한 게시물 목록 조회<br><br>
4. **팔로우 기능** <br>
   - 특정 사용자를 팔로우 / 언팔로우<br>
   - 팔로잉 / 팔로워 목록 조회<br><br>
5. **게시물 자동 생성 기능 (GPT + CRON)** <br>  
   - OpenAI GPT API를 사용하여 감성적인 게시물 문장을 자동 생성  
   - GPT가 반환한 키워드로 Unsplash에서 이미지 검색 후 자동 업로드  
   - NestJS의 `@Schedule` 모듈과 `@Cron` 데코레이터를 이용해 **하루에 1회 게시물 자동 생성**  
   - 보안 강화를 위해 해당 API는 서버 내부용 또는 관리자용 비밀 키로 보호<br><br>



<br><br>

## 📂 프로젝트 구조

📦 src<br>
┣ 📂 auth - 인증 관련 (JWT, 로그인, 회원가입)<br>
┣ 📂 common - 공통 유틸 및 DTO<br>
┣ 📂 like - 좋아요 기능<br>
┣ 📂 bookmark - 북마크 기능<br>
┣ 📂 comment - 댓글 기능<br>
┣ 📂 follow - 팔로우 기능<br>
┣ 📂 post - 게시물 관리<br>
┣ 📂 user - 사용자 정보 관리<br>
┣ 📂 middleware - 미들웨어 <br>
┣ 📂 gpt - GPT API 연동 및 게시물 자동 생성 <br>
┣ 📂 cron - CRON 스케줄링 작업 (자동 게시물 등록) <br>

<br><br>

### 📘 Swagger API 문서 제공

NestJS의 `@nestjs/swagger` 모듈을 활용하여, 전체 API를 문서화하고 테스트할 수 있도록 Swagger UI를 제공하고 있습니다.

- 🔐 인증이 필요한 API는 Authorize 버튼을 통해 JWT 토큰을 입력하여 테스트할 수 있습니다.
- 🚀 문서 링크: [https://joseph-backend.site/api](https://joseph-backend.site/api)

