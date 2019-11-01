const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Profile = require('../models/profile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakEasy = require('speakeasy');
const qrcode = require('qrcode');

router.post('/signup', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    // Find if the user email is already in use
    const priorUser = await User.findOne({ email }).exec();

    // if a user is found, return an error message

    if (priorUser) {
      return res.status(409).json({
        message: 'this email has already been registered'
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

    const profile = new Profile();
    const profileResult = await profile.save();

    // create a new user with the input information and hashed passsword
    const user = new User({
      firstName,
      lastName,
      email,
      password: hash,
      twoFASecret: secret.base32,
      profileId: profileResult._id
    });

    //Asynchronously save the user to the database
    user.save();

    //generate a jwt token before proceeding to 2FA auth
    const token = jwt.sign(
      {
        name: `${firstName} ${lastName}`,
        email,
        twofactor: false
      },
      process.env.JWT_KEY,
      {
        expiresIn: '7d'
      }
    );

    // then return the qrcode for user to scan, Ben should be able to convert the data_url to a image in front end

    const data_url = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      data_url,
      token
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

router.post('/login', async (req, res, next) => {
  try {
    // check if the user exists.
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();

    // if there is no user, return an error message
    if (!user) {
      return res.status(401).json({
        message: 'Auth Failed'
      });
    }

    console.log(user);
    // compare the password entered by the user with the pwd stored in database
    var isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      //return an error if password is incorrect
      return res.status(401).json({
        message: 'Auth Failed'
      });
    }

    const token = jwt.sign(
      {
        name: user.name,
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
});

module.exports = router;

//await Profile.findOneByIdAndUpdate('_sidfgajfgaef',req.body.interests);
