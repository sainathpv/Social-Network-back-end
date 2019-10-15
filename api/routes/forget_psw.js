const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const speakEasy = require('speakeasy');
const qrcode = require('qrcode');
const check2auth = require('../middleware/check-2auth');


router.post("/forget",  (req, res, next) => {
    // first of all find if the user exist
    User.find({email: req.body.email})
    .exec()
    .then(oldUser => {
        // if user does not exist, shows an error
        if (oldUser.length == 0){
            return res.status(409).json({
                message: "This email is not yet registered"
            });
        } 
        // if more than one registered email detected, shows an error
        else if (oldUser.length >=2) {
            return res.status(409).json({
                message: "The input email is invalid"
            })
        }
        else {
            if (req.body.password == req.body.rep_password){
                const salt = bcrypt.genSaltSync(10);
                const hash =  bcrypt.hashSync(req.body.password, salt);
                
                User.update({email: req.body.email}, {
                    $set: {"password": hash}}).exec().then(
                        res.status(200).json({
                            message: "Update success!!"
                        })
                    ).catch(err => {
                        console.log(err);
                        res.status(500).json({error: err});
                    })
                // originaly this will end here, but now it should redirect to twoFA route,
                // I believe for now this will be front end's work (Good Luck!! Thanks for the works!! We could not do it without you)
                // if something wrong, shows an error
            } else {
                return res.status(500).json({
                    message: "Two password are not the same!!!"
                })
            }

        }
    })
    // if something wrong in general, shows an error
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
});



module.exports = router;