const express = require('express');
const router = express.Router();
const {
  createParkingSpace,
  getAllParkingSpaces,
  getParkingSpace,
  updateParkingSpace,
  deleteParkingSpace,
  getMyParkingSpaces
} = require('../controllers/parkingSpaceController');
const { protect, authorize } = require('../middleware/auth');
const { validateParkingSpace, validate } = require('../middleware/validation');

router.route('/')
  .get(getAllParkingSpaces)
  .post(protect, authorize('provider', 'admin'), validateParkingSpace, validate, createParkingSpace);

router.get('/my/spaces', protect, getMyParkingSpaces);

router.route('/:id')
  .get(getParkingSpace)
  .put(protect, updateParkingSpace)
  .delete(protect, deleteParkingSpace);

module.exports = router;
