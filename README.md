# 🚗 주차 거래 플랫폼

개인간 안전하고 편리한 주차공간 거래 플랫폼

**소프트웨어공학 1조**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![React](https://img.shields.io/badge/react-18.2-blue.svg)

## 📋 프로젝트 개요

주차 거래 플랫폼은 주차공간을 제공하는 사람과 주차공간이 필요한 사람을 연결하는 웹 기반 플랫폼입니다.

### 주요 기능
- 🗺️ 위치 기반 주차공간 검색
- 📱 반응형 디자인 (모바일/데스크톱)
- 💳 간편 결제 (카카오페이, 토스)
- ⭐ 리뷰 및 평점 시스템
- 🔒 안전한 JWT 인증
- 📊 관리자 대시보드

## 🛠️ 기술 스택

### Frontend
- React.js 18.2 + TailwindCSS
- React Router, Axios
- Context API

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT, bcryptjs

## 🚀 시작하기

### 설치 및 실행

1. **백엔드 설정**
\`\`\`bash
cd backend
npm install
cp .env.example .env  # 환경 변수 설정
npm run dev  # http://localhost:5000
\`\`\`

2. **프론트엔드 설정**
\`\`\`bash
cd frontend
npm install
npm start  # http://localhost:3000
\`\`\`

3. **MongoDB 실행**
\`\`\`bash
mongod  # 또는 MongoDB Atlas 사용
\`\`\`

## 📁 프로젝트 구조

\`\`\`
Parking_Slot_Purchase_Platform/
├── backend/              # Node.js API 서버
│   ├── src/
│   │   ├── models/      # 데이터 모델
│   │   ├── controllers/ # 비즈니스 로직
│   │   ├── routes/      # API 라우트
│   │   └── middleware/  # 인증/검증
│   └── server.js
├── frontend/            # React 앱
│   ├── src/
│   │   ├── components/  # UI 컴포넌트
│   │   ├── pages/       # 페이지
│   │   ├── services/    # API 통신
│   │   └── contexts/    # 상태 관리
│   └── public/
└── docs/                # 문서
    ├── uml/            # UML 다이어그램
    ├── architecture/   # 아키텍처 문서
    └── SRS.md          # 요구사항 명세서
\`\`\`

## 📚 API 엔드포인트

### 인증
- POST `/api/auth/register` - 회원가입
- POST `/api/auth/login` - 로그인
- GET `/api/auth/me` - 내 정보 조회

### 주차공간
- GET `/api/parking-spaces` - 주차공간 검색
- POST `/api/parking-spaces` - 주차공간 등록
- GET `/api/parking-spaces/:id` - 상세 조회
- PUT `/api/parking-spaces/:id` - 수정
- DELETE `/api/parking-spaces/:id` - 삭제

### 예약
- GET `/api/bookings` - 예약 목록
- POST `/api/bookings` - 예약 생성
- PUT `/api/bookings/:id/cancel` - 예약 취소

### 결제
- POST `/api/payments` - 결제 생성
- PUT `/api/payments/:id/complete` - 결제 완료

### 리뷰
- POST `/api/reviews` - 리뷰 작성
- GET `/api/reviews/parking-space/:id` - 리뷰 조회

## 📖 문서

- [소프트웨어 요구사항 명세서 (SRS)](docs/SRS.md)
- [시스템 아키텍처](docs/architecture/ARCHITECTURE.md)
- [UML 다이어그램](docs/uml/)
  - 클래스 다이어그램
  - 유스케이스 다이어그램
  - 시퀀스 다이어그램

## 🧪 테스트

\`\`\`bash
# 백엔드 테스트
cd backend
npm test

# 프론트엔드 테스트
cd frontend
npm test
\`\`\`

## 👥 팀 정보

**팀명**: 소프트웨어공학 1조
**프로젝트 기간**: 2025.10.14 - 2025.12.11

### 팀 구성
- 김기환 - 위치 기반 검색 서비스 개발, 서버 및 DB 구조 설계
- 김동영 - 예약, 결제 모듈 구현, 주차공간 등록 로직 구현
- 김민창 - 웹 페이지 구성 및 설계, 사용자 및 관리자 UI 제작
- 김진수 - 웹 페이지 구성 및 설계, DB연동 및 백엔드 개발
- AQILAH - DB연동 및 백엔드 개발, 백엔드-프론트 간 데이터 통신 테스트

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

⭐️ Made with ❤️ by Software Engineering Team 1