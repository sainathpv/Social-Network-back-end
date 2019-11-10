const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ProfileController = require('../controllers/profiles');
const check2Auth = require('../middleware/check-2auth');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'staticAssets/images/profiles');
  },
  filename: function(req, file, cb) {
    const fileName =
      req.userData.profileId + path.extname(file.originalname).toLowerCase();
    cb(null, fileName);
  }
});

const fileFilter = function(req, file, cb) {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.post('/editprofile', check2Auth, upload.single('profilePicture'), ProfileController.profile_edit);

router.get('/profile', check2Auth, ProfileController.profile_get);

module.exports = router;
