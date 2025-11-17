const User = require('../models/User');
const ParkingSpace = require('../models/ParkingSpace');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

// @desc    대시보드 통계
// @route   GET /api/admin/stats
// @access  Private (admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    // 전체 통계
    const totalUsers = await User.countDocuments();
    const totalSpaces = await ParkingSpace.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // 이번 달 통계
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyUsers = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const monthlyBookings = await Booking.countDocuments({ createdAt: { $gte: startOfMonth } });
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // 예약 상태별 통계
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 인기 주차공간 Top 5
    const topSpaces = await ParkingSpace.find({ isActive: true })
      .sort('-totalBookings -rating.average')
      .limit(5)
      .select('title address totalBookings rating');

    res.status(200).json({
      success: true,
      data: {
        overall: {
          totalUsers,
          totalSpaces,
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        monthly: {
          newUsers: monthlyUsers,
          bookings: monthlyBookings,
          revenue: monthlyRevenue[0]?.total || 0
        },
        bookingsByStatus,
        topSpaces
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    모든 사용자 조회
// @route   GET /api/admin/users
// @access  Private (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    let query = {};
    if (role) {
      query.role = role;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    사용자 역할 변경
// @route   PUT /api/admin/users/:id/role
// @access  Private (admin)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'provider', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 역할입니다'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      message: '사용자 역할이 변경되었습니다',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    사용자 삭제/비활성화
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      message: '사용자가 삭제되었습니다'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    모든 주차공간 관리
// @route   GET /api/admin/parking-spaces
// @access  Private (admin)
exports.getAllParkingSpaces = async (req, res, next) => {
  try {
    const { isActive, page = 1, limit = 20 } = req.query;

    let query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const spaces = await ParkingSpace.find(query)
      .populate('owner', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ParkingSpace.countDocuments(query);

    res.status(200).json({
      success: true,
      count: spaces.length,
      total,
      pages: Math.ceil(total / limit),
      data: spaces
    });
  } catch (error) {
    next(error);
  }
};

// @desc    주차공간 승인/비활성화
// @route   PUT /api/admin/parking-spaces/:id/status
// @access  Private (admin)
exports.updateSpaceStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const space = await ParkingSpace.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!space) {
      return res.status(404).json({
        success: false,
        message: '주차공간을 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      message: '주차공간 상태가 변경되었습니다',
      data: space
    });
  } catch (error) {
    next(error);
  }
};

// @desc    모든 예약 조회
// @route   GET /api/admin/bookings
// @access  Private (admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('parkingSpace', 'title address')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pages: Math.ceil(total / limit),
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    모든 결제 내역 조회
// @route   GET /api/admin/payments
// @access  Private (admin)
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate({
        path: 'booking',
        populate: { path: 'parkingSpace', select: 'title' }
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
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    리뷰 관리 (숨김/표시)
// @route   PUT /api/admin/reviews/:id/visibility
// @access  Private (admin)
exports.updateReviewVisibility = async (req, res, next) => {
  try {
    const { isVisible } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isVisible },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      message: '리뷰 표시 상태가 변경되었습니다',
      data: review
    });
  } catch (error) {
    next(error);
  }
};
