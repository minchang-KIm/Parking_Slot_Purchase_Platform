const express = require('express');
const router = express.Router();
const {
  createPayment,
  completePayment,
  getPayments,
  getPayment,
  refundPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getPayments)
  .post(protect, createPayment);

router.get('/:id', protect, getPayment);
router.put('/:id/complete', protect, completePayment);
router.put('/:id/refund', protect, refundPayment);

module.exports = router;
