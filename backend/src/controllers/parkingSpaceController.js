const ParkingSpace = require('../models/ParkingSpace');

// @desc    주차공간 등록
// @route   POST /api/parking-spaces
// @access  Private (provider, admin)
exports.createParkingSpace = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;

    const parkingSpace = await ParkingSpace.create(req.body);

    res.status(201).json({
      success: true,
      message: '주차공간이 등록되었습니다',
      data: parkingSpace
    });
  } catch (error) {
    next(error);
  }
};

// @desc    모든 주차공간 조회 (필터링 및 검색)
// @route   GET /api/parking-spaces
// @access  Public
exports.getAllParkingSpaces = async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      radius = 5000, // 기본 5km
      availability,
      spaceType,
      minPrice,
      maxPrice,
      features,
      page = 1,
      limit = 20
    } = req.query;

    let query = { isActive: true };

    // 위치 기반 검색
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    // 필터링
    if (availability) {
      query.availability = availability;
    }

    if (spaceType) {
      query.spaceType = spaceType;
    }

    if (minPrice || maxPrice) {
      query['price.hourly'] = {};
      if (minPrice) query['price.hourly'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.hourly'].$lte = parseFloat(maxPrice);
    }

    if (features) {
      query.features = { $all: features.split(',') };
    }

    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const parkingSpaces = await ParkingSpace.find(query)
      .populate('owner', 'name phone avatar')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-rating.average createdAt');

    const total = await ParkingSpace.countDocuments(query);

    res.status(200).json({
      success: true,
      count: parkingSpaces.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: parkingSpaces
    });
  } catch (error) {
    next(error);
  }
};

// @desc    특정 주차공간 조회
// @route   GET /api/parking-spaces/:id
// @access  Public
exports.getParkingSpace = async (req, res, next) => {
  try {
    const parkingSpace = await ParkingSpace.findById(req.params.id)
      .populate('owner', 'name phone avatar email');

    if (!parkingSpace) {
      return res.status(404).json({
        success: false,
        message: '주차공간을 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      data: parkingSpace
    });
  } catch (error) {
    next(error);
  }
};

// @desc    주차공간 수정
// @route   PUT /api/parking-spaces/:id
// @access  Private (owner, admin)
exports.updateParkingSpace = async (req, res, next) => {
  try {
    let parkingSpace = await ParkingSpace.findById(req.params.id);

    if (!parkingSpace) {
      return res.status(404).json({
        success: false,
        message: '주차공간을 찾을 수 없습니다'
      });
    }

    // 소유자 확인
    if (parkingSpace.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이 주차공간을 수정할 권한이 없습니다'
      });
    }

    parkingSpace = await ParkingSpace.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: '주차공간이 수정되었습니다',
      data: parkingSpace
    });
  } catch (error) {
    next(error);
  }
};

// @desc    주차공간 삭제
// @route   DELETE /api/parking-spaces/:id
// @access  Private (owner, admin)
exports.deleteParkingSpace = async (req, res, next) => {
  try {
    const parkingSpace = await ParkingSpace.findById(req.params.id);

    if (!parkingSpace) {
      return res.status(404).json({
        success: false,
        message: '주차공간을 찾을 수 없습니다'
      });
    }

    // 소유자 확인
    if (parkingSpace.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이 주차공간을 삭제할 권한이 없습니다'
      });
    }

    // Soft delete (isActive를 false로 변경)
    parkingSpace.isActive = false;
    await parkingSpace.save();

    res.status(200).json({
      success: true,
      message: '주차공간이 삭제되었습니다'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    내 주차공간 목록 조회
// @route   GET /api/parking-spaces/my/spaces
// @access  Private
exports.getMyParkingSpaces = async (req, res, next) => {
  try {
    const parkingSpaces = await ParkingSpace.find({ owner: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: parkingSpaces.length,
      data: parkingSpaces
    });
  } catch (error) {
    next(error);
  }
};
