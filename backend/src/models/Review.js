const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  parkingSpace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpace',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, '평점을 입력해주세요'],
    min: [1, '평점은 1점 이상이어야 합니다'],
    max: [5, '평점은 5점 이하여야 합니다']
  },
  comment: {
    type: String,
    required: [true, '리뷰 내용을 입력해주세요'],
    maxlength: [1000, '리뷰는 1000자 이내로 입력해주세요']
  },
  images: [{
    type: String
  }],
  helpful: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  response: {
    text: String,
    respondedAt: Date
  },
  isVisible: {
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

// 한 예약당 하나의 리뷰만 작성 가능
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ parkingSpace: 1, isVisible: 1 });
reviewSchema.index({ user: 1 });

// 리뷰 작성 후 주차공간의 평점 업데이트
reviewSchema.post('save', async function() {
  const ParkingSpace = mongoose.model('ParkingSpace');

  const stats = await this.constructor.aggregate([
    {
      $match: { parkingSpace: this.parkingSpace, isVisible: true }
    },
    {
      $group: {
        _id: '$parkingSpace',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await ParkingSpace.findByIdAndUpdate(this.parkingSpace, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].count
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
