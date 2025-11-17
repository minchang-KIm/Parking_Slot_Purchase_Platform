const Booking = require('../models/Booking');
const ParkingSpace = require('../models/ParkingSpace');
const moment = require('moment');

// @desc    예약 생성
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { parkingSpace, startTime, endTime, vehicleInfo, specialRequests } = req.body;

    // 주차공간 확인
    const space = await ParkingSpace.findById(parkingSpace);
    if (!space) {
      return res.status(404).json({
        success: false,
        message: '주차공간을 찾을 수 없습니다'
      });
    }

    if (space.availability !== 'available') {
      return res.status(400).json({
        success: false,
        message: '현재 이용 불가능한 주차공간입니다'
      });
    }

    // 시간 겹침 확인
    const conflictingBooking = await Booking.findOne({
      parkingSpace,
      status: { $in: ['confirmed', 'in_progress'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: '해당 시간에 이미 예약이 존재합니다'
      });
    }

    // 가격 계산
    const start = moment(startTime);
    const end = moment(endTime);
    const hours = Math.ceil(end.diff(start, 'hours', true));
    const totalPrice = hours * space.price.hourly;

    // 예약 생성
    const booking = await Booking.create({
      user: req.user.id,
      parkingSpace,
      startTime,
      endTime,
      duration: { hours },
      totalPrice,
      vehicleInfo,
      specialRequests,
      status: 'pending'
    });

    await booking.populate(['user', 'parkingSpace']);

    res.status(201).json({
      success: true,
      message: '예약이 생성되었습니다',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    예약 목록 조회
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('parkingSpace')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    특정 예약 조회
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('parkingSpace');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다'
      });
    }

    // 권한 확인
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이 예약을 조회할 권한이 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    예약 취소
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다'
      });
    }

    // 권한 확인
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이 예약을 취소할 권한이 없습니다'
      });
    }

    // 이미 취소되었거나 완료된 예약은 취소 불가
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: '이미 취소되었거나 완료된 예약입니다'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason;
    booking.cancelledAt = Date.now();
    await booking.save();

    res.status(200).json({
      success: true,
      message: '예약이 취소되었습니다',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    예약 확인 (주차공간 소유자용)
// @route   PUT /api/bookings/:id/confirm
// @access  Private (provider, admin)
exports.confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('parkingSpace');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다'
      });
    }

    // 주차공간 소유자 확인
    if (booking.parkingSpace.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이 예약을 확인할 권한이 없습니다'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '대기 중인 예약만 확인할 수 있습니다'
      });
    }

    booking.status = 'confirmed';
    await booking.save();

    res.status(200).json({
      success: true,
      message: '예약이 확인되었습니다',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    내 주차공간의 예약 목록 조회
// @route   GET /api/bookings/my-spaces/bookings
// @access  Private (provider, admin)
exports.getMySpaceBookings = async (req, res, next) => {
  try {
    // 내 주차공간들 찾기
    const mySpaces = await ParkingSpace.find({ owner: req.user.id }).select('_id');
    const spaceIds = mySpaces.map(space => space._id);

    const bookings = await Booking.find({ parkingSpace: { $in: spaceIds } })
      .populate('user', 'name email phone')
      .populate('parkingSpace', 'title address')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};
