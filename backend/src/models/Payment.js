const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['kakao_pay', 'toss', 'card', 'bank_transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentProvider: {
    type: String,
    enum: ['kakao', 'toss', 'stripe', 'paypal']
  },
  providerTransactionId: String,
  metadata: {
    type: Map,
    of: String
  },
  refund: {
    amount: {
      type: Number,
      default: 0
    },
    reason: String,
    refundedAt: Date
  },
  paidAt: Date,
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

// 결제 인덱스
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
