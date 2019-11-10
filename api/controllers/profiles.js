const Profile = require('../models/profile');

exports.profile_edit = async (req, res, next) => {
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

exports.profile_get = async (req, res, next) => {
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
}