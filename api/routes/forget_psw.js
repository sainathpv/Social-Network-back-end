const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const speakEasy = require('speakeasy');
const qrcode = require('qrcode');
const check2auth = require('../middleware/check-2auth');


router.post("/reset", (req, res, next) => {
    console.log(req.body.token)
    User.findOne({ resetPswToken: req.body.token, resetPswExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            
            return res.status(401).json({
                message: "Email is not valid"
            })
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        user.password = hash
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save()
            .catch(err => {
                console.log(err);
                return res.status(500).json({
                    message: "save is not successful",
                    error: err
                })
            });

        return res.status(200).json({
            message: "Update successful"
        })



    }).catch(err => {
            console.log(err);
            return res.status(500).json({
                message: "nothing is find",
                error: err
            })
        });
})


module.exports = router;