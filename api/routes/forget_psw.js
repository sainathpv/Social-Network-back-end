const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const speakEasy = require('speakeasy');
const qrcode = require('qrcode');
const check2auth = require('../middleware/check-2auth');


router.post("/forget/:token",  (req, res, next) => {
    User.findOne({ resetPswToken: req.params.token, resetPswExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          return res.status(200).json({
              message: "Email is not valid"
          })
        }

        if (req.body.password == req.body.rep_password){
            const salt = bcrypt.genSaltSync(10);
            const hash =  bcrypt.hashSync(req.body.password, salt);
            user.password = hash
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            return res.status(500).json({
                message: "Update successful"
            })

        } else {
            return res.status(500).json({
                message: "Two password are not the same!!!"
            })
        }

        user.save()
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                message: "save is not successful",
                error: err})
        });
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({
            message: "nothing is find",
            error: err
        })
    });
})


module.exports = router;