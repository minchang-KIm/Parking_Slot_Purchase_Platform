const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    결제 생성
// @route   POST /api/payments
// @access  Private
exports.createPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    // 예약 확인
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다'
      });
    }

    // 권한 확인
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '이 예약에 대한 결제 권한이 없습니다'
      });
    }

    // 이미 결제되었는지 확인
    const existingPayment = await Payment.findOne({
      booking: bookingId,
      status: { $in: ['completed', 'pending'] }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: '이미 결제가 진행 중이거나 완료되었습니다'
      });
    }

    // 결제 생성
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user.id,
      amount: booking.totalPrice,
      paymentMethod,
      status: 'pending',
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    res.status(201).json({
      success: true,
      message: '결제가 생성되었습니다',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    결제 완료 처리
// @route   PUT /api/payments/:id/complete
// @access  Private
exports.completePayment = async (req, res, next) => {
  try {
    const { providerTransactionId } = req.body;

    const payment = await Payment.findById(req.params.id).populate('booking');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '결제를 찾을 수 없습니다'
      });
    }

    // 권한 확인
    if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이 결제를 처리할 권한이 없습니다'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '대기 중인 결제만 완료할 수 있습니다'
      });
    }

    // 실제 결제 API 연동 로직이 여기에 들어갑니다
    // 예: Kakao Pay, Toss API 호출

    payment.status = 'completed';
    payment.paidAt = Date.now();
    payment.providerTransactionId = providerTransactionId;
    await payment.save();

    // 예약 상태 업데이트
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: '결제가 완료되었습니다',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    결제 내역 조회
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(query)
      .populate({
        path: 'booking',
        populate: { path: 'parkingSpace', select: 'title address' }
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    특정 결제 조회
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'booking',
        populate: { path: 'parkingSpace', select: 'title address price' }
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '결제를 찾을 수 없습니다'
      });
    }

    // 권한 확인
    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이 결제를 조회할 권한이 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    환불 요청
// @route   PUT /api/payments/:id/refund
// @access  Private
exports.refundPayment = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '결제를 찾을 수 없습니다'
      });
    }

    // 권한 확인
    if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이 결제를 환불할 권한이 없습니다'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: '완료된 결제만 환불할 수 있습니다'
      });
    }

    // 실제 환불 API 연동 로직이 여기에 들어갑니다

    payment.status = 'refunded';
    payment.refund = {
      amount: payment.amount,
      reason,
      refundedAt: Date.now()
    };
    await payment.save();

    // 예약 상태 업데이트
    await Booking.findByIdAndUpdate(payment.booking, {
      paymentStatus: 'refunded',
      status: 'cancelled'
    });

    res.status(200).json({
      success: true,
      message: '환불이 완료되었습니다',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};
