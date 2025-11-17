const { body, param, query, validationResult } = require('express-validator');

// 유효성 검사 결과 확인
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '입력값 검증 실패',
      errors: errors.array()
    });
  }
  next();
};

// 회원가입 유효성 검사
exports.validateRegister = [
  body('name').trim().notEmpty().withMessage('이름을 입력해주세요'),
  body('email').isEmail().withMessage('올바른 이메일 형식이 아닙니다'),
  body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다'),
  body('phone').matches(/^[0-9]{10,11}$/).withMessage('올바른 전화번호 형식이 아닙니다')
];

// 로그인 유효성 검사
exports.validateLogin = [
  body('email').isEmail().withMessage('올바른 이메일 형식이 아닙니다'),
  body('password').notEmpty().withMessage('비밀번호를 입력해주세요')
];

// 주차공간 등록 유효성 검사
exports.validateParkingSpace = [
  body('title').trim().notEmpty().withMessage('제목을 입력해주세요'),
  body('description').trim().notEmpty().withMessage('설명을 입력해주세요'),
  body('address').trim().notEmpty().withMessage('주소를 입력해주세요'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('위치 좌표를 입력해주세요'),
  body('price.hourly').isNumeric().withMessage('시간당 가격을 입력해주세요'),
  body('spaceType').isIn(['outdoor', 'indoor', 'covered', 'garage']).withMessage('올바른 주차공간 타입을 선택해주세요')
];

// 예약 유효성 검사
exports.validateBooking = [
  body('parkingSpace').notEmpty().withMessage('주차공간을 선택해주세요'),
  body('startTime').isISO8601().withMessage('올바른 시작 시간 형식이 아닙니다'),
  body('endTime').isISO8601().withMessage('올바른 종료 시간 형식이 아닙니다'),
  body('vehicleInfo.licensePlate').notEmpty().withMessage('차량 번호를 입력해주세요')
];

// 리뷰 유효성 검사
exports.validateReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('평점은 1~5점 사이여야 합니다'),
  body('comment').trim().notEmpty().withMessage('리뷰 내용을 입력해주세요')
];
