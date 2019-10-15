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
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    firstname: oldUser.firstname,
                    lastname: oldUser.lastname, 
                    password: hash,
                    //userImage: req.file.path,
                    email: oldUser.email
                });

            
            // if only one user exist, hash the current user's password 
            // create user using the input information and hashed username
            

            // store the current user to the mongodb
                user
                .save()
                .then(result => {
                    // MFAOptions & secret will generate a secret
                    const MFAOptions = {
                        issuer: 'Hoosier Connection',
                        user: req.body.email,
                        length: 64
                    }
                    const secret = speakEasy.generateSecret(MFAOptions);
                    
                    const token = jwt.sign({
                        name: user.name,
                        email: user.email,
                        twofactor: false
                    },
                
                    process.env.JWT_KEY,{
                        expiresIn:'1h'
                    });

                    // update the user that is just created:
                    User.update({email: req.body.email}, {
                    $set: {"twoFASecret" : secret.base32}}).exec().then(
                        // then return the qrcode for user to scan, Ben should be able to convert the data_url to a image in front end
                        result => {
                            console.log(result);
                            qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
                                res.status(200).json({
                                    img: data_url,
                                    token:  token
                                });
                            });
                            res.status(200).json({
                                message: "Update success!!"
                            })
                        })
                        //if anything wrong, throws an error
                        .catch(err => {
                        console.log(err);
                        res.status(500).json({error: err});
                    });
                    
                })
                // originaly this will end here, but now it should redirect to twoFA route,
                // I believe for now this will be front end's work (Good Luck!! Thanks for the works!! We could not do it without you)
                // if something wrong, shows an error
                .catch(err => {
                    console.log(err)
                    res.status(500).json({error: err})
                });
            } else {
                return res.status(500).json({
                    message: "Two email are not the same!!!"
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