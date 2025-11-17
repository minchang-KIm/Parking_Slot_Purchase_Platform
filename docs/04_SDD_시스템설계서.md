# 시스템 설계서 (SDD)
# System Design Document

**프로젝트명**: 개인간 주차 거래 플랫폼
**작성일**: 2025년 11월 17일
**버전**: 1.0
**작성자**: 소프트웨어공학 1조

---

## 1. 문서 개요

### 1.1 문서 목적
본 문서는 주차 거래 플랫폼의 시스템 설계를 상세히 기술한다. 개발팀이 시스템을 구현하는데 필요한 기술적 사양과 설계 결정사항을 제공한다.

### 1.2 범위
- 시스템 아키텍처 설계
- 데이터베이스 설계
- API 인터페이스 설계
- 보안 설계
- 성능 및 확장성 설계

### 1.3 참조 문서
- 소프트웨어 요구사항 명세서 (SRS)
- 프로젝트 발표자료

---

## 2. 시스템 아키텍처

### 2.1 전체 시스템 구조

```
┌─────────────────────────────────────────────────┐
│           클라이언트 계층 (Frontend)             │
│       React.js + TailwindCSS + Axios            │
│   - 사용자 인터페이스                            │
│   - 상태 관리 (Context API)                     │
│   - 클라이언트 사이드 라우팅                     │
└────────────────┬────────────────────────────────┘
                 │ HTTPS/REST API
┌────────────────┴────────────────────────────────┐
│        애플리케이션 서버 계층 (Backend)          │
│         Node.js + Express.js                    │
│   - RESTful API 엔드포인트                       │
│   - 비즈니스 로직 처리                           │
│   - JWT 인증 및 권한 관리                        │
│   - 데이터 유효성 검증                           │
└────────────────┬────────────────────────────────┘
                 │ Mongoose ODM
┌────────────────┴────────────────────────────────┐
│          데이터베이스 계층                       │
│              MongoDB                            │
│   - 사용자 데이터                                │
│   - 주차공간 데이터                              │
│   - 예약 및 결제 데이터                          │
│   - 리뷰 데이터                                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│          외부 서비스 연동                        │
│   - Kakao Map API / Google Maps API            │
│   - KakaoPay API / Toss Payments API           │
└─────────────────────────────────────────────────┘
```

### 2.2 시스템 컴포넌트

#### 2.2.1 프론트엔드 컴포넌트
- **Presentation Layer**: React 컴포넌트 (페이지, UI 컴포넌트)
- **State Management**: Context API (AuthContext)
- **Service Layer**: API 통신 서비스 (axios)
- **Routing**: React Router v6

#### 2.2.2 백엔드 컴포넌트
- **API Gateway**: Express.js 라우터
- **Controller Layer**: 요청/응답 처리
- **Service Layer**: 비즈니스 로직
- **Data Access Layer**: Mongoose 모델
- **Middleware**: 인증, 검증, 에러 처리

---

## 3. 데이터베이스 설계

### 3.1 개념적 설계 (ER 다이어그램)

```
[User] 1 ──── * [ParkingSpace]
  │                    │
  │ 1                  │ 1
  │                    │
  │ *                  │ *
[Booking] ── 1:1 ── [Payment]
  │
  │ 1
  │
  │ 0..1
[Review]
```

### 3.2 논리적 설계 (스키마)

#### 3.2.1 Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required, max 50),
  email: String (required, unique, lowercase),
  password: String (required, hashed, min 6),
  phone: String (required, 10-11 digits),
  role: Enum ['user', 'provider', 'admin'],
  avatar: String (URL),
  address: String,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**인덱스**:
- `email`: unique index (로그인 최적화)

#### 3.2.2 ParkingSpaces Collection
```javascript
{
  _id: ObjectId,
  owner: ObjectId (ref: User),
  title: String (required, max 100),
  description: String (required, max 1000),
  address: String (required),
  location: {
    type: "Point",
    coordinates: [longitude, latitude] // GeoJSON
  },
  price: {
    hourly: Number (required, min 0),
    daily: Number (min 0),
    monthly: Number (min 0)
  },
  availability: Enum ['available', 'occupied', 'unavailable'],
  spaceType: Enum ['outdoor', 'indoor', 'covered', 'garage'],
  spaceSize: Enum ['compact', 'standard', 'large', 'xlarge'],
  features: Array of Enum ['cctv', 'security', 'ev_charging', 'covered', 'lighting', 'accessible'],
  images: [String],
  availableTimeSlots: [{
    dayOfWeek: Number (0-6),
    startTime: String,
    endTime: String
  }],
  rating: {
    average: Number (0-5),
    count: Number
  },
  totalBookings: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**인덱스**:
- `location`: 2dsphere index (위치 기반 검색)
- `owner`: index
- `availability, isActive`: compound index

#### 3.2.3 Bookings Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  parkingSpace: ObjectId (ref: ParkingSpace),
  startTime: Date (required),
  endTime: Date (required),
  duration: {
    hours: Number
  },
  totalPrice: Number (required, min 0),
  status: Enum ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
  paymentStatus: Enum ['pending', 'paid', 'refunded', 'failed'],
  vehicleInfo: {
    licensePlate: String (required),
    model: String,
    color: String
  },
  specialRequests: String (max 500),
  cancellationReason: String,
  cancelledAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**인덱스**:
- `parkingSpace, startTime, endTime`: compound index (중복 예약 방지)
- `user, status`: compound index

#### 3.2.4 Payments Collection
```javascript
{
  _id: ObjectId,
  booking: ObjectId (ref: Booking),
  user: ObjectId (ref: User),
  amount: Number (required, min 0),
  paymentMethod: Enum ['kakao_pay', 'toss', 'card', 'bank_transfer'],
  status: Enum ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
  transactionId: String (unique),
  paymentProvider: Enum ['kakao', 'toss', 'stripe', 'paypal'],
  providerTransactionId: String,
  metadata: Map,
  refund: {
    amount: Number,
    reason: String,
    refundedAt: Date
  },
  paidAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**인덱스**:
- `booking`: index
- `transactionId`: unique index
- `user, status`: compound index

#### 3.2.5 Reviews Collection
```javascript
{
  _id: ObjectId,
  parkingSpace: ObjectId (ref: ParkingSpace),
  booking: ObjectId (ref: Booking, unique),
  user: ObjectId (ref: User),
  rating: Number (required, 1-5),
  comment: String (required, max 1000),
  images: [String],
  helpful: Number (default 0),
  helpfulBy: [ObjectId],
  response: {
    text: String,
    respondedAt: Date
  },
  isVisible: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**인덱스**:
- `booking`: unique index (중복 리뷰 방지)
- `parkingSpace, isVisible`: compound index

---

## 4. API 설계

### 4.1 API 아키텍처

- **스타일**: RESTful API
- **프로토콜**: HTTPS
- **데이터 포맷**: JSON
- **인증**: JWT Bearer Token

### 4.2 API 엔드포인트 명세

#### 4.2.1 인증 API (Authentication)

**Base URL**: `/api/auth`

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| POST | /register | 회원가입 | ❌ |
| POST | /login | 로그인 | ❌ |
| GET | /me | 내 정보 조회 | ✅ |
| PUT | /profile | 프로필 수정 | ✅ |
| PUT | /password | 비밀번호 변경 | ✅ |

**예시 - 회원가입**
```http
POST /api/auth/register
Content-Type: application/json

Request:
{
  "name": "홍길동",
  "email": "hong@example.com",
  "password": "password123",
  "phone": "01012345678",
  "role": "user"
}

Response: 201 Created
{
  "success": true,
  "message": "회원가입이 완료되었습니다",
  "data": {
    "user": {
      "_id": "...",
      "name": "홍길동",
      "email": "hong@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 4.2.2 주차공간 API (Parking Spaces)

**Base URL**: `/api/parking-spaces`

| Method | Endpoint | 설명 | 인증 필요 | 권한 |
|--------|----------|------|-----------|------|
| GET | / | 주차공간 검색 | ❌ | - |
| POST | / | 주차공간 등록 | ✅ | provider |
| GET | /:id | 주차공간 상세 | ❌ | - |
| PUT | /:id | 주차공간 수정 | ✅ | owner/admin |
| DELETE | /:id | 주차공간 삭제 | ✅ | owner/admin |
| GET | /my/spaces | 내 주차공간 목록 | ✅ | provider |

**예시 - 위치 기반 검색**
```http
GET /api/parking-spaces?lat=37.5665&lng=126.9780&radius=5000
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "count": 15,
  "total": 15,
  "pages": 1,
  "currentPage": 1,
  "data": [
    {
      "_id": "...",
      "title": "강남역 주차공간",
      "address": "서울특별시 강남구...",
      "location": {
        "type": "Point",
        "coordinates": [126.9780, 37.5665]
      },
      "price": {
        "hourly": 5000
      },
      "rating": {
        "average": 4.5,
        "count": 20
      },
      "spaceType": "indoor",
      "availability": "available"
    }
  ]
}
```

#### 4.2.3 예약 API (Bookings)

**Base URL**: `/api/bookings`

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| GET | / | 예약 목록 | ✅ |
| POST | / | 예약 생성 | ✅ |
| GET | /:id | 예약 상세 | ✅ |
| PUT | /:id/cancel | 예약 취소 | ✅ |
| PUT | /:id/confirm | 예약 확인 | ✅ (provider) |

#### 4.2.4 결제 API (Payments)

**Base URL**: `/api/payments`

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| GET | / | 결제 내역 | ✅ |
| POST | / | 결제 생성 | ✅ |
| GET | /:id | 결제 상세 | ✅ |
| PUT | /:id/complete | 결제 완료 | ✅ |
| PUT | /:id/refund | 환불 요청 | ✅ |

#### 4.2.5 리뷰 API (Reviews)

**Base URL**: `/api/reviews`

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| POST | / | 리뷰 작성 | ✅ |
| GET | /parking-space/:id | 주차공간 리뷰 조회 | ❌ |
| GET | /my | 내 리뷰 목록 | ✅ |
| PUT | /:id | 리뷰 수정 | ✅ |
| DELETE | /:id | 리뷰 삭제 | ✅ |
| PUT | /:id/helpful | 도움됨 표시 | ✅ |
| PUT | /:id/response | 리뷰 응답 | ✅ (provider) |

---

## 5. 보안 설계

### 5.1 인증 및 인가

#### JWT 토큰 기반 인증
```
- 알고리즘: HS256
- 토큰 만료: 7일
- 토큰 저장: localStorage (클라이언트)
- 토큰 전송: Authorization: Bearer {token}
```

#### 역할 기반 접근 제어 (RBAC)
```
- user: 일반 사용자 권한
- provider: 공간 제공자 권한 (user 권한 포함)
- admin: 관리자 권한 (모든 권한)
```

### 5.2 데이터 보안

- **비밀번호 암호화**: bcrypt (salt rounds: 10)
- **데이터 전송**: HTTPS 사용
- **민감 정보 보호**: 환경 변수 사용 (.env)
- **SQL Injection 방지**: Mongoose ODM 사용
- **XSS 방지**: 입력 데이터 검증 및 이스케이프

### 5.3 API 보안

- **CORS 정책**: 허용된 도메인만 접근
- **Rate Limiting**: API 호출 제한 (추후 구현)
- **Helmet.js**: HTTP 보안 헤더
- **입력 유효성 검증**: express-validator

---

## 6. 성능 설계

### 6.1 데이터베이스 최적화

#### 인덱싱 전략
```javascript
// 자주 조회되는 필드에 인덱스
users: { email: 1 } // unique
parkingspaces: { location: "2dsphere" } // 위치 검색
bookings: { parkingSpace: 1, startTime: 1, endTime: 1 } // 중복 확인
```

#### 쿼리 최적화
- Population 최소화
- Select로 필요한 필드만 조회
- Pagination 적용 (기본 20개)

### 6.2 API 성능

- **응답 시간 목표**: 평균 2초 이내
- **동시 접속자**: 1,000명 지원
- **캐싱**: Redis 캐싱 (추후 구현)

---

## 7. 확장성 설계

### 7.1 수평적 확장

- **무상태 API 서버**: JWT 토큰 기반
- **로드 밸런싱**: Nginx 또는 AWS ALB
- **데이터베이스 샤딩**: MongoDB Sharding

### 7.2 수직적 확장

- **서버 리소스 증설**
- **데이터베이스 인덱스 최적화**

---

## 8. 배포 아키텍처

### 8.1 개발 환경
```
- Frontend: localhost:3000
- Backend: localhost:5000
- Database: localhost:27017
```

### 8.2 프로덕션 환경
```
- Frontend: Vercel/Netlify
- Backend: Heroku/AWS EC2
- Database: MongoDB Atlas
- CDN: CloudFlare
```

---

## 9. 기술 스택 상세

### 9.1 프론트엔드
```
- React.js 18.2.0
- TailwindCSS 3.3.6
- React Router 6.20.1
- Axios 1.6.2
- React Hook Form 7.48.2
- React Hot Toast 2.4.1
```

### 9.2 백엔드
```
- Node.js 18+
- Express.js 4.18.2
- Mongoose 8.0.3
- bcryptjs 2.4.3
- jsonwebtoken 9.0.2
- express-validator 7.0.1
- helmet 7.1.0
- cors 2.8.5
- morgan 1.10.0
```

### 9.3 개발 도구
```
- Git (버전 관리)
- npm (패키지 관리)
- Jest (테스트)
- Nodemon (개발 서버)
```

---

## 10. 비기능 요구사항 구현

### 10.1 성능
- ✅ API 응답 시간: 평균 2초 이내
- ✅ 동시 접속자: 1,000명 지원

### 10.2 보안
- ✅ 비밀번호 암호화 (bcrypt)
- ✅ JWT 토큰 인증
- ✅ HTTPS 지원
- ✅ CORS 정책

### 10.3 사용성
- ✅ 반응형 디자인
- ✅ 직관적인 UI/UX
- ✅ 다국어 지원 준비 (한국어)

### 10.4 유지보수성
- ✅ 모듈화된 코드 구조
- ✅ 명확한 주석
- ✅ 문서화

---

## 11. 향후 개선 사항

### 11.1 단기 개선 (1-3개월)
- WebSocket 실시간 통신 구현
- Redis 캐싱 도입
- 이미지 업로드 기능 구현
- 실제 지도 API 연동
- 실제 결제 API 연동

### 11.2 중기 개선 (3-6개월)
- 알림 시스템 (Push Notification)
- 채팅 기능
- 다국어 지원 확대
- 모바일 앱 개발

### 11.3 장기 개선 (6-12개월)
- AI 기반 주차공간 추천
- 블록체인 기반 결제
- IoT 센서 연동

---

**작성자**: 소프트웨어공학 1조
**승인자**: [승인자명]
**승인일**: 2025년 11월 17일
