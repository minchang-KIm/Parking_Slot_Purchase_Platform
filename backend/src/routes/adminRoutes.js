const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllParkingSpaces,
  updateSpaceStatus,
  getAllBookings,
  getAllPayments,
  updateReviewVisibility
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// 모든 라우트는 admin 권한 필요
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/parking-spaces', getAllParkingSpaces);
router.put('/parking-spaces/:id/status', updateSpaceStatus);

router.get('/bookings', getAllBookings);
router.get('/payments', getAllPayments);

router.put('/reviews/:id/visibility', updateReviewVisibility);

module.exports = router;
