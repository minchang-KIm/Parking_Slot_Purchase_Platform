# 시스템 아키텍처 문서
# 주차 거래 플랫폼

**버전:** 1.0
**작성일:** 2025년 11월 17일

---

## 1. 시스템 개요

주차 거래 플랫폼은 3-Tier 아키텍처를 기반으로 설계된 웹 애플리케이션입니다.

```
┌─────────────────────────────────────────┐
│         프레젠테이션 계층               │
│     (React.js + TailwindCSS)            │
│    - 사용자 인터페이스                  │
│    - 상태 관리 (Zustand/Context)        │
│    - API 호출 (Axios)                   │
└──────────────┬──────────────────────────┘
               │ HTTP/HTTPS (REST API)
┌──────────────┴──────────────────────────┐
│          비즈니스 로직 계층             │
│        (Node.js + Express)              │
│    - API 라우팅                         │
│    - 비즈니스 로직 처리                 │
│    - 인증/인가 (JWT)                    │
│    - 유효성 검증                        │
└──────────────┬──────────────────────────┘
               │ MongoDB Driver
┌──────────────┴──────────────────────────┐
│          데이터 계층                    │
│        (MongoDB + Mongoose)             │
│    - 데이터 저장 및 조회                │
│    - 인덱싱 및 최적화                   │
└─────────────────────────────────────────┘
```

## 2. 아키텍처 스타일

### 2.1 클라이언트-서버 아키텍처
- **클라이언트**: React.js SPA (Single Page Application)
- **서버**: Node.js RESTful API 서버
- **통신**: HTTP/HTTPS를 통한 JSON 데이터 교환

### 2.2 레이어드 아키텍처

#### 프레젠테이션 계층 (Frontend)
- **기술 스택**: React.js, TailwindCSS
- **역할**: 사용자 인터페이스 렌더링 및 사용자 상호작용 처리
- **구조**:
  ```
  src/
  ├── components/    # 재사용 가능한 UI 컴포넌트
  ├── pages/         # 페이지 컴포넌트
  ├── services/      # API 통신 로직
  ├── contexts/      # 전역 상태 관리
  └── utils/         # 유틸리티 함수
  ```

#### 비즈니스 로직 계층 (Backend)
- **기술 스택**: Node.js, Express.js
- **역할**: API 엔드포인트 제공, 비즈니스 로직 처리
- **구조**:
  ```
  src/
  ├── routes/        # API 라우팅
  ├── controllers/   # 요청 처리 및 응답
  ├── models/        # 데이터 모델
  ├── middleware/    # 인증, 에러 처리 등
  └── config/        # 설정 파일
  ```

#### 데이터 계층
- **기술 스택**: MongoDB, Mongoose ODM
- **역할**: 데이터 영구 저장 및 관리

## 3. 주요 컴포넌트

### 3.1 인증 시스템
```
┌─────────────┐
│   클라이언트  │
└──────┬──────┘
       │ 1. 로그인 요청 (email, password)
       ▼
┌─────────────┐
│  Auth API   │
│ (/api/auth) │
└──────┬──────┘
       │ 2. 사용자 확인
       ▼
┌─────────────┐
│  Database   │
└──────┬──────┘
       │ 3. 사용자 정보 반환
       ▼
┌─────────────┐
│  Auth API   │
└──────┬──────┘
       │ 4. JWT 토큰 생성 및 반환
       ▼
┌─────────────┐
│   클라이언트  │ (토큰 저장 in localStorage)
└─────────────┘
```

### 3.2 주차공간 검색 시스템
- **위치 기반 검색**: MongoDB의 2dsphere 인덱스 사용
- **필터링**: 가격, 타입, 특징 기반 쿼리
- **페이지네이션**: 효율적인 데이터 로딩

### 3.3 예약 시스템
```
사용자 요청 → 예약 검증 → 중복 확인 → 가격 계산 → 예약 생성
                           ↓
                      결제 진행 → 결제 확인 → 예약 확정
```

### 3.4 결제 시스템
- **결제 게이트웨이**: 카카오페이, 토스 API 연동
- **트랜잭션 관리**: 결제 실패 시 롤백 처리
- **환불 처리**: 취소 정책에 따른 자동 환불

## 4. 데이터베이스 설계

### 4.1 컬렉션 구조
```
parking_platform (Database)
├── users              # 사용자 정보
├── parkingspaces      # 주차공간 정보
├── bookings           # 예약 정보
├── payments           # 결제 정보
└── reviews            # 리뷰 정보
```

### 4.2 주요 인덱스
- `users.email`: 고유 인덱스 (로그인 최적화)
- `parkingspaces.location`: 2dsphere 인덱스 (위치 검색)
- `bookings.parkingSpace, startTime, endTime`: 복합 인덱스 (중복 검색)

## 5. API 설계

### 5.1 RESTful API 원칙
- **리소스 기반 URL**: `/api/parking-spaces`, `/api/bookings`
- **HTTP 메서드**: GET, POST, PUT, DELETE
- **상태 코드**: 200 (성공), 201 (생성), 400 (잘못된 요청), 401 (인증 실패), 404 (Not Found)

### 5.2 API 엔드포인트 구조
```
/api
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── GET /me
│   └── PUT /profile
├── /parking-spaces
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   ├── PUT /:id
│   └── DELETE /:id
├── /bookings
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   └── PUT /:id/cancel
├── /payments
│   ├── GET /
│   ├── POST /
│   └── PUT /:id/complete
└── /reviews
    ├── GET /parking-space/:id
    ├── POST /
    ├── PUT /:id
    └── DELETE /:id
```

## 6. 보안 아키텍처

### 6.1 인증 및 인가
- **JWT 토큰**: Stateless 인증 방식
- **토큰 만료**: 7일 자동 만료
- **역할 기반 접근 제어(RBAC)**: user, provider, admin

### 6.2 보안 조치
- **비밀번호 암호화**: bcrypt (salt rounds: 10)
- **CORS 정책**: 허용된 도메인만 접근 가능
- **Helmet.js**: HTTP 헤더 보안
- **입력 유효성 검증**: express-validator

## 7. 확장성 고려사항

### 7.1 수평적 확장
- **무상태 API**: 서버 복제 가능
- **로드 밸런서**: Nginx 또는 AWS ALB
- **데이터베이스 샤딩**: MongoDB 샤딩 지원

### 7.2 캐싱 전략
- **Redis**: 자주 조회되는 데이터 캐싱
- **CDN**: 정적 리소스 배포

## 8. 배포 아키텍처

```
                    Internet
                        ↓
                ┌───────────────┐
                │ Load Balancer │
                └───────┬───────┘
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │  Web    │   │  Web    │   │  Web    │
    │ Server 1│   │ Server 2│   │ Server 3│
    └────┬────┘   └────┬────┘   └────┬────┘
         └─────────────┼─────────────┘
                       ↓
              ┌─────────────────┐
              │  API Server     │
              │  (Node.js)      │
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │  MongoDB        │
              │  (Cluster)      │
              └─────────────────┘
```

## 9. 모니터링 및 로깅

### 9.1 로깅
- **Morgan**: HTTP 요청 로깅
- **Winston**: 애플리케이션 로그

### 9.2 모니터링
- **Health Check 엔드포인트**: `/health`
- **성능 메트릭**: 응답 시간, 에러율
- **알림**: 오류 발생 시 즉시 알림

## 10. 기술 스택 요약

### Frontend
- React.js 18.2
- TailwindCSS 3.3
- React Router 6
- Axios
- React Hook Form

### Backend
- Node.js 18+
- Express.js 4.18
- MongoDB 8.0
- Mongoose 8.0
- JWT
- bcrypt

### DevOps
- Git (버전 관리)
- npm (패키지 관리)
- Jest (테스트)
