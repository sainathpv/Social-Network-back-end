const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const speakEasy = require('speakeasy');
const qrcode = require('qrcode');
const check2auth = require('../middleware/check-2auth');


router.post("/forget_psw_email",  (req, res, next) => {
    User.find({email: req.body.email})
    .exec()
    .then(oldUser => {
        // if user does not exist, shows an error
        if (oldUser.length >=2 | oldUser.length <= 0) {
            return res.status(409).json({
                message: "The input email is invalid"
            })
        }
        else {

        }
    })
    // if something wrong in general, shows an error
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
});

module.exports = router;