import { format, formatDistance, formatRelative } from 'date-fns';
import { ko } from 'date-fns/locale';

// 날짜 포맷팅
export const formatDate = (date, formatStr = 'yyyy-MM-dd HH:mm') => {
  return format(new Date(date), formatStr, { locale: ko });
};

// 상대 시간
export const formatRelativeTime = (date) => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true, locale: ko });
};

// 가격 포맷팅
export const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
};

// 전화번호 포맷팅
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
};

// 예약 상태 라벨
export const getBookingStatusLabel = (status) => {
  const labels = {
    pending: '대기중',
    confirmed: '확정됨',
    in_progress: '이용중',
    completed: '완료됨',
    cancelled: '취소됨',
  };
  return labels[status] || status;
};

// 예약 상태 색상
export const getBookingStatusColor = (status) => {
  const colors = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    in_progress: 'badge-success',
    completed: 'badge-success',
    cancelled: 'badge-danger',
  };
  return colors[status] || 'badge-info';
};

// 결제 상태 라벨
export const getPaymentStatusLabel = (status) => {
  const labels = {
    pending: '대기중',
    completed: '완료됨',
    failed: '실패',
    refunded: '환불됨',
    cancelled: '취소됨',
  };
  return labels[status] || status;
};

// 주차공간 타입 라벨
export const getSpaceTypeLabel = (type) => {
  const labels = {
    outdoor: '야외',
    indoor: '실내',
    covered: '지붕있음',
    garage: '차고',
  };
  return labels[type] || type;
};

// 주차공간 크기 라벨
export const getSpaceSizeLabel = (size) => {
  const labels = {
    compact: '소형',
    standard: '일반',
    large: '대형',
    xlarge: '특대형',
  };
  return labels[size] || size;
};

// 별점 렌더링
export const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= rating ? '★' : '☆');
  }
  return stars.join('');
};

// 에러 메시지 추출
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.errors && Array.isArray(error.errors)) {
    return error.errors.map(e => e.msg).join(', ');
  }
  return '오류가 발생했습니다';
};

// 거리 계산 (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

// 이미지 URL 생성
export const getImageUrl = (path) => {
  if (!path) return '/images/placeholder.png';
  if (path.startsWith('http')) return path;
  return `${process.env.REACT_APP_API_URL}/${path}`;
};

// 클래스명 조합
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
