const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parkingSpace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpace',
    required: true
  },
  startTime: {
    type: Date,
    required: [true, '시작 시간을 입력해주세요']
  },
  endTime: {
    type: Date,
    required: [true, '종료 시간을 입력해주세요']
  },
  duration: {
    hours: {
      type: Number,
      required: true
    }
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  vehicleInfo: {
    licensePlate: {
      type: String,
      required: [true, '차량 번호를 입력해주세요']
    },
    model: String,
    color: String
  },
  specialRequests: {
    type: String,
    maxlength: [500, '특별 요청사항은 500자 이내로 입력해주세요']
  },
  cancellationReason: String,
  cancelledAt: Date,
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

// 예약 중복 방지를 위한 인덱스
bookingSchema.index({ parkingSpace: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1, status: 1 });

// 예약 시간 검증
bookingSchema.pre('save', function(next) {
  if (this.startTime >= this.endTime) {
    return next(new Error('종료 시간은 시작 시간보다 늦어야 합니다'));
  }

  // 시간 차이 계산 (시간 단위)
  const diffMs = this.endTime - this.startTime;
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  this.duration.hours = diffHours;

  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
