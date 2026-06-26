// bill.routes.js

const express = require('express');
const router  = express.Router();

const {
  getMyBills,
  createPaymentOrder,
  verifyPayment
} = require('../controllers/bill.controller');

const { protect } = require('../middleware/auth.middleware');

// All bill routes require authentication
router.use(protect);

router.get('/',              getMyBills);
router.post('/pay/:billId',  createPaymentOrder);
router.post('/verify',       verifyPayment);

module.exports = router;