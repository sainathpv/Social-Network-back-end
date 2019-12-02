const Profile = require('../models/profile');
const User = require('../models/user');
const fs = require('fs');

//copied from images.js
function saveImageToDisk(localPath, image) {
  //console.log("it works here in image too")
  var buf = new Buffer(image, 'base64');
  `console.log("it works here in image after buff")
  fs.access("./staticAssets/images/image_1574074955286.jpg", error => {
    if (!error) {
        console.log("it works")
    } else {
        console.log("it does not")
    }
  });`

  fs.writeFile( "./staticAssets/images/" + localPath, buf, error =>{
    console.log(error)
  });
  
  //console.log("it works here in image after saving")
}

exports.profile_image_upload = (req, res, next) => {
  
  var path;
  var data;
  var type = req.body.image.split(',')[0]
  data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
  if("data:image/png;base64" === type){
      path = "image_" + Date.now() + ".png";
  }else if("data:image/jpg;base64"){
      path = "image_" + Date.now() + ".jpg";
  }else if("data:image/jpeg;base64"){
      path = "image_" + Date.now() + ".jpeg";
  }else if("data:image/gif;base64"){
      path = "image_" + Date.now() + ".gif";
  }else{
      return res.status(400).json({
          message: "Malformed"
      });
  }
  //console.log("it works here in upload function")
  saveImageToDisk(path, data);

  var url = "/assets/images/" + path

  const profileUpdate = {};

  profileUpdate.profileImageUrl = url;
  
  const profile = Profile.updateOne(
    { user: req.userData.userID },
    {
      $set: {
        ...profileUpdate
      }
    }
  ).catch(err =>{
    res.status(409).json({
      message: "image path invalid",
    })
  });

  res.status(200).json({
    message: "profile image update success!"
  });
}

exports.profile_edit = async (req, res, next) => {
    try {
      const profileUpdate = {};
      const userUpdate = {};
      const { trueName, bio, name, major, studentYear, studentType} = req.body;
      if (bio) profileUpdate.bio = bio;
      if (name) {
        profileUpdate.name = name;
        userUpdate.userName = name;
      }
      profileUpdate.studentType = studentType;
      profileUpdate.year = studentYear;

      console.log("this is my name"+ name)
      if (trueName) userUpdate.trueName = trueName;
      //if (interests) profileUpdate.interests = interests.split(', ');
      if (major) profileUpdate.major = major;

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
        trueName: user.trueName, 
        ...profile._doc
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        message: 'Server error'
      });
    }
}
