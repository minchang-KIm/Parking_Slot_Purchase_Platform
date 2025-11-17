# 배포 가이드

## 빌드 및 실행

### 1. 백엔드 빌드 및 실행

```bash
cd backend

# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 프로덕션 설정 입력

# 개발 모드 실행
npm run dev

# 프로덕션 모드 실행
npm start
```

### 2. 프론트엔드 빌드 및 실행

```bash
cd frontend

# 패키지 설치
npm install

# 개발 모드 실행
npm start

# 프로덕션 빌드
npm run build
# build 폴더가 생성됩니다
```

### 3. 데이터베이스 설정

#### 로컬 MongoDB
```bash
# MongoDB 설치 및 실행
mongod --dbpath /path/to/data/directory
```

#### MongoDB Atlas (권장)
1. MongoDB Atlas 계정 생성
2. 클러스터 생성
3. 연결 문자열 복사
4. .env 파일에 MONGODB_URI 설정

### 4. 테스트 실행

```bash
# 백엔드 테스트
cd backend
npm test

# 프론트엔드 테스트
cd frontend
npm test
```

## 프로덕션 배포

### 백엔드 배포 (예: Heroku)

```bash
# Heroku CLI 로그인
heroku login

# Heroku 앱 생성
heroku create parking-platform-api

# MongoDB 애드온 추가
heroku addons:create mongolab

# 환경 변수 설정
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production

# 배포
git push heroku main
```

### 프론트엔드 배포 (예: Vercel/Netlify)

```bash
# 빌드
npm run build

# Vercel 배포
vercel --prod

# 또는 Netlify 배포
netlify deploy --prod --dir=build
```

## 환경 변수

### 백엔드 필수 환경 변수
- `PORT`: 서버 포트 (기본: 5000)
- `MONGODB_URI`: MongoDB 연결 문자열
- `JWT_SECRET`: JWT 시크릿 키
- `NODE_ENV`: 환경 (development/production)

### 프론트엔드 필수 환경 변수
- `REACT_APP_API_URL`: 백엔드 API URL
- `REACT_APP_KAKAO_MAP_API_KEY`: 카카오 맵 API 키

## 주의사항

1. 프로덕션 환경에서는 반드시 강력한 JWT_SECRET 사용
2. CORS 설정을 프로덕션 도메인으로 제한
3. HTTPS 사용 필수
4. 데이터베이스 정기 백업 설정
5. 로그 모니터링 시스템 구축

## 성능 최적화

1. 프론트엔드: React.lazy()를 사용한 코드 스플리팅
2. 백엔드: Redis 캐싱 구현
3. 데이터베이스: 적절한 인덱스 설정
4. CDN 사용 (정적 리소스)
5. 이미지 최적화 및 압축
