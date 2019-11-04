const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Profile = require('../models/profile');
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

router.post('/editprofile', check2Auth, upload.single('profilePicture'), async (req, res, next) => {
    try {
      const objForUpdate = {};
      const { bio, interests, major } = req.body;

      if (bio) objForUpdate.bio = bio;
      if (interests) objForUpdate.interests = interests.split(', ');
      if (major) objForUpdate.major = major;
      if (req.file) {
        objForUpdate.profileImageUrl = `/assets/images/profiles/${
          req.userData.profileId
        }${path.extname(req.file.originalname).toLowerCase()}`;
      }

      const profile = await Profile.updateOne(
        { user: req.userData.userid },
        {
          $set: {
            ...objForUpdate
          }
        }
      );
      
      res.status(201).json({
        ...objForUpdate
      });
      
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Server error'
      });
    }
  }
);

router.get('/profile/', check2Auth, async (req, res, next) => {
  try {
    const profile = await Profile.findOne(
      {
        user: req.userData.userID
      }
    ).exec();
    
    if (!profile) {
      return res.status(400).json({
        message: 'profile not found'
      });
    }

    const { name } = req.userData;

    //const { _id, ...profileData } = profile;
    return res.status(200).json({
      name,
      ...profile._doc
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;
