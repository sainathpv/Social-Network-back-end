const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profiles');
const check2Auth = require('../middleware/check-2auth');

router.post('/editprofile', check2Auth, ProfileController.profile_edit);

router.get('/profile', check2Auth, ProfileController.profile_get);

router.post('/editprofile_interest', check2Auth, ProfileController.profile_interest_edit);

router.post('/editProfileImage', check2Auth, ProfileController.profile_image_upload);

router.post('/miniProfile', ProfileController.profile_get_mini);

module.exports = router;
