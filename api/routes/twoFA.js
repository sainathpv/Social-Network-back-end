const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const speakEasy = require('speakeasy');
const checkAuth = require('../middleware/check-auth');

// for login, after varified user's secret, we ask user for the 6 letter token on their phone
router.post('/twoFALogin', checkAuth, async (req, res, next) => {
  try {
    const email = req.userData.email;
    const otp = req.body.token;
    const user = await User.findOne({ email }).exec();

    console.log(otp)
    console.log(req.body.token)
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
        Authentication: 'Failed'
      });
    }

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

    return res.status(200).json({
      Authentication: 'Successful',
      token: jwtToken
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error'
    });
  }
});

module.exports = router;
