const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const ImageController = require('../controllers/images');
const check2Auth = require('../middleware/check-2auth');
router.use(bodyParser.json({ limit: '50mb' }));
router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
router.post('/imageUpload', check2Auth, ImageController.images_upload);

module.exports = router;
