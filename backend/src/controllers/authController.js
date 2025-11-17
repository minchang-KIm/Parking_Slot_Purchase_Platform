const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    회원가입
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 이메일입니다'
      });
    }

    // 사용자 생성
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user'
    });

    // 토큰 생성 및 응답
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    로그인
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 사용자 확인
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // 비밀번호 확인
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // 토큰 생성 및 응답
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: '로그인이 완료되었습니다',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    내 프로필 조회
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    프로필 수정
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      avatar: req.body.avatar
    };

    // undefined 값 제거
    Object.keys(fieldsToUpdate).forEach(
      key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: '프로필이 수정되었습니다',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    비밀번호 변경
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // 현재 비밀번호 확인
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다'
      });
    }

    // 새 비밀번호 저장
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: '비밀번호가 변경되었습니다'
    });
  } catch (error) {
    next(error);
  }
};
