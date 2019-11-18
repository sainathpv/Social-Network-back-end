const express = require('express');
const router = express.Router();
const ImageController = require('../controllers/images');
const check2Auth = require('../middleware/check-2auth');

router.post('/imageUpload', check2Auth, ImageController.images_upload);

module.exports = router;
