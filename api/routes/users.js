const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const speakEasy = require('speakeasy');
const qrcode = require('qrcode');


// this is the sign up page
router.post("/signup",  (req, res, next) => {
    console.log("TESTING: \n \n " + req.body.name);
    // first of all find if the user exist
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        // if user exist before, return an error saying that the user is in mongodb already
        const salt = bcrypt.genSaltSync(10);
        const hash =  bcrypt.hashSync(req.body.password, salt);
        
        if (user.length >= 1){
            return res.status(409).json({
                message: "this email has already been registered"
            });
        } else {
            // if the user does not exist, hash the current user's password 

            // create user using the input information and hashed username
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                firstname: req.body.firstname,
                lastname: req.body.lastname, 
                password: hash,
                //userImage: req.file.path,
                email: req.body.email
            });
            
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
                console.log(err);
                res.status(500).json({error: err});
            });

        }
    })
    // if something wrong in general, shows an error
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
});

// this is the post for login
router.post('/login', (req, res, next) => {
    
    // check if the user exist. 
    User.findOne({email: req.body.email})
    .exec()
    .then(user => {
        /*
        var options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                secret : "6LeACsAUAAAAADabygLnhkLCdTP8GAhaW49l-RW8", 
                response : req.body.captcha, 
            }),
        };
        console.log(options.body)
        fetch("https://www.google.com/recaptcha/api/siteverify", options).then( result =>{
            if(result.status === 200){
                return result.json();
            }else{
                console.log(result);
                return null;
            }
        }).then( result => {
            if(result === null){

            }else{
                console.log(result);
                return null
                /*
                //add cookie
                var date = new Date();
                date = new Date(date.getTime() + (60*60*1000));
                Cookie.setCookie('HC_JWT', result.token, date); 
                //redirect to 2factor
                this.setState({twofactor: true});
            }
        });*/
        console.log(req.body)
        // if there are no user, or if the user has multiple users, return an error
        var result = bcrypt.compareSync(req.body.password, user.password);
        // compare the user password with the mongodb's password
        console.log(result);
        // if matches, redirect to the 2-auth page
        if (result){
            if (req.body.captcha !== ""){

                const token = jwt.sign({
                    name: user.name,
                    email: user.email,
                    twofactor: false
                },
            
                process.env.JWT_KEY,{
                    expiresIn:'1h'
                });

                return res.status(200).json({
                    meesage: "Logged In",
                    token: token
                });
            } else {
                return res.status(409).json({
                    message: "Captcha not verified"
                })
            }
        }
        // if anything wrong, returns an error
        return res.status(401).json({
            meesage: "Auth Failed"
        });
    })
});


//this is the delete user if anything gets wrong
router.delete('/delete',  (req, res, next) => {
    // remove the user according to userID (_id in mongodb)
    User.remove({_id:req.params.userID})
    .exec()
    .then(result => {
        res.status(200).json({
            message: "User deleted"
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
});

module.exports = router;