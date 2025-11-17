const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  confirmBooking,
  getMySpaceBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { validateBooking, validate } = require('../middleware/validation');

router.route('/')
  .get(protect, getBookings)
  .post(protect, validateBooking, validate, createBooking);

router.get('/my-spaces/bookings', protect, authorize('provider', 'admin'), getMySpaceBookings);

router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/confirm', protect, authorize('provider', 'admin'), confirmBooking);

module.exports = router;
