const Profile = require('../models/profile');
const User = require('../models/user');

exports.profile_edit = async (req, res, next) => {
    try {
      const profileUpdate = {};
      const userUpdate = {};
      const { bio, interests, name, major, fname, lname} = req.body;

      if (bio) profileUpdate.bio = bio;
      if (name) {
        profileUpdate.name = name;
        userUpdate.userName = name;
      }

      console.log("this is my name"+ name)
      if (fname) userUpdate.firstName = fname;
      if (lname) userUpdate.lastName = lname;
      //if (interests) profileUpdate.interests = interests.split(', ');
      if (major) profileUpdate.major = major;
      if (req.file) {
        profileUpdate.profileImageUrl = `/assets/images/profiles/${
          req.userData.profileId
        }${path.extname(req.file.originalname).toLowerCase()}`;
      }

      const profile = await Profile.updateOne(
        { user: req.userData.userID },
        {
          $set: {
            ...profileUpdate
          }
        }
      );

      const newUser = await User.updateOne(
        { _id: req.userData.userID },
        {
          $set: {
            ...userUpdate
          }
        }
      );
      
      res.status(201).json({
        ...profileUpdate
      });
      
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Server error'
      });
    }
}

exports.profile_interest_edit = async (req, res, next) => {
  try {
    const profileUpdate = {};
    profileUpdate.interests = req.body.interests;

    const profile = await Profile.updateOne(
      { user: req.userData.userID },
      {
        $set: {
          ...profileUpdate
        }
      }
    );
    
    res.status(201).json({
      ...profileUpdate
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

      const user = await User.findOne(
        {
          _id: req.userData.userID
        }
      ).exec();

      if (!user) {
        return res.status(400).json({
          message: 'user not found'
        });
      }
  
      const { name } = req.userData;

      console.log(user)
  
      //const { _id, ...profileData } = profile;
      return res.status(200).json({
        name,
        fname: user.firstName, 
        lname: user.lastName,
        ...profile._doc
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        message: 'Server error'
      });
    }
}