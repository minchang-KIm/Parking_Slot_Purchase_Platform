const mongoose = require('mongoose');

const parkingSpaceSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, '주차공간 제목을 입력해주세요'],
    trim: true,
    maxlength: [100, '제목은 100자 이내로 입력해주세요']
  },
  description: {
    type: String,
    required: [true, '주차공간 설명을 입력해주세요'],
    maxlength: [1000, '설명은 1000자 이내로 입력해주세요']
  },
  address: {
    type: String,
    required: [true, '주소를 입력해주세요']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [경도, 위도]
      required: true,
      index: '2dsphere'
    }
  },
  price: {
    hourly: {
      type: Number,
      required: [true, '시간당 가격을 입력해주세요'],
      min: [0, '가격은 0 이상이어야 합니다']
    },
    daily: {
      type: Number,
      min: [0, '가격은 0 이상이어야 합니다']
    },
    monthly: {
      type: Number,
      min: [0, '가격은 0 이상이어야 합니다']
    }
  },
  availability: {
    type: String,
    enum: ['available', 'occupied', 'unavailable'],
    default: 'available'
  },
  spaceType: {
    type: String,
    enum: ['outdoor', 'indoor', 'covered', 'garage'],
    required: true
  },
  spaceSize: {
    type: String,
    enum: ['compact', 'standard', 'large', 'xlarge'],
    default: 'standard'
  },
  features: [{
    type: String,
    enum: ['cctv', 'security', 'ev_charging', 'covered', 'lighting', 'accessible']
  }],
  images: [{
    type: String
  }],
  availableTimeSlots: [{
    dayOfWeek: {
      type: Number, // 0-6 (일요일-토요일)
      required: true
    },
    startTime: {
      type: String, // "09:00" 형식
      required: true
    },
    endTime: {
      type: String, // "18:00" 형식
      required: true
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 위치 기반 검색을 위한 인덱스
parkingSpaceSchema.index({ location: '2dsphere' });
parkingSpaceSchema.index({ availability: 1, isActive: 1 });
parkingSpaceSchema.index({ 'price.hourly': 1 });
parkingSpaceSchema.index({ 'rating.average': -1 });

module.exports = mongoose.model('ParkingSpace', parkingSpaceSchema);
