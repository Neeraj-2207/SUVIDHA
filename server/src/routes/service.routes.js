const express = require('express');
const router  = express.Router();

const {
  applyForService,
  getMyServiceRequests,
  getServiceRequestById
} = require('../controllers/service.controller');

const { protect }      = require('../middleware/auth.middleware');
const { upload }       = require('../config/cloudinary');

router.use(protect);

router.get('/',    getMyServiceRequests);
router.post('/',   upload.array('documents', 3), applyForService);
router.get('/:id', getServiceRequestById);

module.exports = router;