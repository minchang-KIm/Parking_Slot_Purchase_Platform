const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    리뷰 작성
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment, images } = req.body;

    // 예약 확인
    const booking = await Booking.findById(bookingId).populate('parkingSpace');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다'
      });
    }

    // 권한 확인 (예약한 사람만 리뷰 작성 가능)
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '이 예약에 대한 리뷰를 작성할 권한이 없습니다'
      });
    }

    // 예약이 완료되었는지 확인
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: '완료된 예약만 리뷰를 작성할 수 있습니다'
      });
    }

    // 이미 리뷰가 작성되었는지 확인
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: '이미 리뷰가 작성되었습니다'
      });
    }

    // 리뷰 생성
    const review = await Review.create({
      parkingSpace: booking.parkingSpace._id,
      booking: bookingId,
      user: req.user.id,
      rating,
      comment,
      images
    });

    await review.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: '리뷰가 작성되었습니다',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    주차공간의 리뷰 목록 조회
// @route   GET /api/reviews/parking-space/:parkingSpaceId
// @access  Public
exports.getParkingSpaceReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({
      parkingSpace: req.params.parkingSpaceId,
      isVisible: true
    })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({
      parkingSpace: req.params.parkingSpaceId,
      isVisible: true
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    내 리뷰 목록 조회
// @route   GET /api/reviews/my
// @access  Private
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('parkingSpace', 'title address')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    리뷰 수정
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다'
      });
    }

    // 권한 확인
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '이 리뷰를 수정할 권한이 없습니다'
      });
    }

    const { rating, comment, images } = req.body;

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.images = images || review.images;

    await review.save();

    res.status(200).json({
      success: true,
      message: '리뷰가 수정되었습니다',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    리뷰 삭제
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다'
      });
    }

    // 권한 확인
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이 리뷰를 삭제할 권한이 없습니다'
      });
    }

    // Soft delete
    review.isVisible = false;
    await review.save();

    res.status(200).json({
      success: true,
      message: '리뷰가 삭제되었습니다'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    리뷰 도움됨 표시
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다'
      });
    }

    // 이미 도움됨 표시를 했는지 확인
    const alreadyMarked = review.helpfulBy.includes(req.user.id);

    if (alreadyMarked) {
      // 도움됨 취소
      review.helpfulBy = review.helpfulBy.filter(
        userId => userId.toString() !== req.user.id
      );
      review.helpful -= 1;
    } else {
      // 도움됨 추가
      review.helpfulBy.push(req.user.id);
      review.helpful += 1;
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: alreadyMarked ? '도움됨이 취소되었습니다' : '도움됨으로 표시되었습니다',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    리뷰에 답변 작성 (주차공간 소유자)
// @route   PUT /api/reviews/:id/response
// @access  Private (provider, admin)
exports.addResponse = async (req, res, next) => {
  try {
    const { text } = req.body;

    const review = await Review.findById(req.params.id).populate('parkingSpace');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다'
      });
    }

    // 주차공간 소유자 확인
    if (review.parkingSpace.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이 리뷰에 답변할 권한이 없습니다'
      });
    }

    review.response = {
      text,
      respondedAt: Date.now()
    };

    await review.save();

    res.status(200).json({
      success: true,
      message: '답변이 작성되었습니다',
      data: review
    });
  } catch (error) {
    next(error);
  }
};
