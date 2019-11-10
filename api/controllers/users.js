const User = require('../models/user');
const Profile = require('../models/profile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakEasy = require('speakeasy');
const qrcode = require('qrcode');
const mongoose = require('mongoose');

exports.users_signup = async (req, res, next) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      // Find if the user email is already in use
      const priorUser = await User.findOne({ email }).exec();
  
      // if a user is found, return an error message
      if (priorUser) {
        if (priorUser.authorization === true) {
          return res.status(409).json({
            message: 'This email has already been registered'
          });
        } else {
          console.log(priorUser._id)
          User.remove({ _id: priorUser._id })
            .exec()
            .then(result => {
              console.log(result);
            })
            .catch(err => {
              console.log(err);
              return res.status(500).json({ error: err })
            });
  
          Profile.remove({ user: priorUser._id })
            .exec()
            .then(result => {
              console.log(result);
            })
            .catch(err => {
              console.log(err);
              return res.status(500).json({ error: err })
            });
        }
      }
  
      if (password.length < 6) {
        return res.status(409).json({
          message: 'Password needs to have at least 6 characters'
        });
      }
  
      // if the user does not exist, hash the new user's password
  
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
  
      // MFAOptions & secret will generate a secret
      const MFAOptions = {
        issuer: 'Hoosier Connection',
        user: email,
        length: 64
      };
  
      const secret = speakEasy.generateSecret(MFAOptions);
  
      console.log("it works here")
  
      // create a new user with the input information and hashed passsword
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hash,
        twoFASecret: secret.base32,
        authorization: false
      });
  
      const profile = new Profile({
        _id: new mongoose.Types.ObjectId(),
        user: user._id,
        name: user.firstName + " " + user.lastName,
      });
  
      //Asynchronously save the user to the database
      user.save().then().catch(err => {
        return res.status(409).json({
          message: 'Your email format is not valid'
        });
      });
  
      profile.save();
  
      //generate a jwt token before proceeding to 2FA auth
      const token = jwt.sign(
        {
          userid: user._id,
          email: email,
          twofactor: false
        },
        process.env.JWT_KEY,
        {
          expiresIn: '7d'
        }
      );
  
      // then return the qrcode for user to scan, Ben should be able to convert the data_url to a image in front end
      const data_url = await qrcode.toDataURL(secret.otpauth_url);
  
      return res.status(200).json({
        data_url,
        token
      });
  
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
}

exports.users_login = async (req, res, next) => {
    try {
      // check if the user exists.
      const { email, password, captcha } = req.body;
      const user = await User.findOne({ email }).exec();
      // if there is no user, return an error message
      if (!user) {
        return res.status(401).json({
          message: 'Your input email is not correct!'
        });
      }
  
      // compare the password entered by the user with the pwd stored in database
      var isPasswordValid = bcrypt.compareSync(password, user.password);
  
      if (!isPasswordValid) {
        //return an error if password is incorrect
        return res.status(401).json({
          message: 'Your input password is not correct!'
        });
      }
  
      if (captcha == "") {
        return res.status(401).json({
          message: 'Please click the captcha button!!'
        });
      }
  
  
      const token = jwt.sign({
        _id: user._id,
        email: user.email,
        twofactor: false
      },
  
        process.env.JWT_KEY,
        {
          expiresIn: '7d'
        }
      );
  
      return res.status(200).json({
        message: 'Logged In',
        token: token
      });
    } catch (error) {
      res.status(500).json({
        message: 'Server Error'
      });
    }
}

exports.users_delete = (req, res, next) => {
    // remove the user according to userID (_id in mongodb)
    User.remove({ _id: req.body.userID })
        .exec()
        .then(result => {
            res.status(200).json({
            message: "User deleted"
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
  
  
    Profile.remove({ user: req.body.userID })
        .exec()
        .then(result => {
        res.status(200).json({
            message: "Profile deleted"
        })
        })
        .catch(err => {
        console.log(err);
        res.status(500).json({ error: err })
        });
  
}

exports.users_2fa = async (req, res, next) => {
    try {
      const email = req.userData.email;
      const otp = req.body.token;
      const user = await User.findOne({ email }).exec();

      // verifing if the user's secret is related to the 6 letter token from the user
      //this is still having some issue, I will go fix this later
      var verified = speakEasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token: otp,
        window: 1
      });
  
      if (!verified) {
        return res.status(401).json({
          message: 'The Code you entered is not valid'
        });
      }
  
      user.authorization = true; 
  
      const { firstName, lastName, profileId } = user;
  
      const jwtToken = jwt.sign(
        {
          userID: user._id,
          email,
          twoFactor: true,
          profileId //sending the profile ID of the user inside the JWT token
        },
        process.env.JWT_KEY,
        {
          expiresIn: '7d'
        }
      );
  
      user.save().then(result =>{
        console.log(result)
      }).catch(err => {
        return res.status(401).json({
          message: "something is wrong when changing the authorization",
        });
      })
  
      return res.status(200).json({
        Authentication: 'Successful',
        token: jwtToken
      });
    } catch (error) {
      res.status(500).json({
        message: 'Server error'
      });
    }
}   