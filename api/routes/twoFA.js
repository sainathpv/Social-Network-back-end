const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require('jsonwebtoken');
const speakEasy = require('speakeasy');
const checkAuth = require('../middleware/check-auth');

// for login, after varified user's secret, we ask user for the 6 letter token on their phone
router.post('/twoFALogin', checkAuth,  (req, res, next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {

        // verifing if the user's secret is related to the 6 letter token from the user
        //this is still having some issue, I will go fix this later
        var verified = speakEasy.totp.verify({
            secret: user[0].twoFASecret,
            encoding: 'base32',
            token: req.body.token,
            window:1
        });
        
        if(!verified){ //generate JWT token if 2FA is successful
            const token = jwt.sign({
                name: user.name,
                email: user.email,
                twoFactor: true
            },
            process.env.JWT_KEY,
            {
                expiresIn:'1h'
            });
    
            res.status(200).json({
                Authentication: "Successful",
                JWTToken: token
            });
        }

        //if anything goes wrong, return an error
        else{
            res.status(401).json({
                Authentication: "Failed"
            });
        }

        });
    })

module.exports = router;