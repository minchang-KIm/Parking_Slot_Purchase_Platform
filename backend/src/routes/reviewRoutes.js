const express = require('express');
const router = express.Router();
const {
  createReview,
  getParkingSpaceReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  markHelpful,
  addResponse
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const { validateReview, validate } = require('../middleware/validation');

router.post('/', protect, validateReview, validate, createReview);
router.get('/parking-space/:parkingSpaceId', getParkingSpaceReviews);
router.get('/my', protect, getMyReviews);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.put('/:id/helpful', protect, markHelpful);
router.put('/:id/response', protect, authorize('provider', 'admin'), addResponse);

module.exports = router;
