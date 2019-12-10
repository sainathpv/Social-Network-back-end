const User = require('../models/user');
const Profile = require('../models/profile');
const Friend = require('../models/friends');
const Post = require("../models/post");
const Poll = require("../models/poll");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakEasy = require('speakeasy');
const qrcode = require('qrcode');
const mongoose = require('mongoose');

async function deletePriorUser(user) {
    if (user.authorization) {
        return true;
    } else {
        User.deleteOne({ _id: user._id })
            .exec()
            .then(result => {

            })
            .catch(err => {
                console.log(err);
            });

        Profile.deleteOne({ user: user._id })
            .exec()
            .then(result => {
                return false;
            })
            .catch(err => {
                console.log(err);
            });
    }
}

exports.users_postQuestions = async (req, res, next) => {
    try {
        var user = await User.findById(req.userData.userid).exec();
        if (user.questions.length === 0) {

            var questions = req.body.questions;
            for (var i = 0; i < 3; i++) {
                const salt = bcrypt.genSaltSync(10);
                questions[i].answer = bcrypt.hashSync(questions[i].answer, salt);
            }
            user.questions = questions;
            user.save().then(result => {
                return res.status(200).json({
                    message: "OKAY"
                });
            }).catch(err => {
                console.log(err);
                return res.status(500).json({ message: "ERROR" });
            });
        } else {
            res.status(401).json({
                message: "UNAUTHORIZED"
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "ERROR"
        });
    }
}

exports.users_signup = async (req, res, next) => {
    try {
        const { name, email, userName, password } = req.body;
        // Find if the user email is already in use
        var priorUser = await User.findOne({ email }).exec();

        // if a user is found, return an error message
        if (priorUser) {
            var user = await deletePriorUser(priorUser)
            if (user) {
                return res.status(409).json({
                    message: 'This email has already been registered'
                });
            }

        }
        var priorUser = await User.findOne({ userName: req.body.userName }).exec();

        if (priorUser) {
            var user = await deletePriorUser(priorUser);
            if (user) {
                return res.status(409).json({
                    message: 'This Username has already been registered'
                });
            }
        }

        if (password.length <= 8) {
            return res.status(409).json({
                message: 'Password needs to have at least 8 characters'
            });
        }

        // if the user does not exist, hash the new user's password
        const salt = bcrypt.genSaltSync(10);
        const pwdHash = bcrypt.hashSync(password, salt);


        // MFAOptions & secret will generate a secret
        const MFAOptions = {
            issuer: 'Hoosier Connection',
            user: email,
            length: 64
        };

        const secret = speakEasy.generateSecret(MFAOptions);
        // create a new user with the input information and hashed passsword
        var user;

        user = new User({
            _id: new mongoose.Types.ObjectId(),
            trueName: name,
            userName: userName,
            email: email,
            password: pwdHash,
            twoFASecret: secret.base32,
            authorization: false
        });

        console.log(req.body);


        const profile = new Profile({
            _id: new mongoose.Types.ObjectId(),
            user: user._id,
            interests: ["questions"],
            accountType: req.body.accountType,
            name: user.userName,
        });

        const friends = new Friend({
            _id: new mongoose.Types.ObjectId(),
            profileID: profile._id
        });

        console.log("it works here");

        profile.friends = friends._id;

        const data_url = await qrcode.toDataURL(secret.otpauth_url);
        //Asynchronously save the user to the database
        var save = await user.save();
        var save2 = await profile.save();
        var save3 = await friends.save();
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

        if (user.captcha) {
            if (captcha == "") {
                return res.status(412).json({
                    message: 'Please fill out the captcha.'
                });
            }
        }

        user.captcha = false;
        var result = await user.save();
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
    User.deleteOne({ _id: req.userData.userID })
        .exec()
        .then(result => {
            console.log("current user deleted")
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                error: err,
                message: "Error occured when deleting user data"
            })
        });
    console.log("it works here");
    Profile.findOneAndDelete({ user: req.userData.userID })
        .exec()
        .then(function (profile) {
            if (!profile) {
                res.status(400).json({
                    message: 'profile not found'
                });
            } else {
                var profileID = profile._id;
                Friend.findOneAndDelete({ profileID: profileID })
                    .exec()
                    .then(function (friends) {
                        if (friends) {
                            var listOfFriends = friends.profiles;
                            if (listOfFriends) {
                                for (var i = 0; i < listOfFriends.length; i++) {
                                    var curProfileID = listOfFriends[i].profileID
                                    Friend.findOne({ profileID: curProfileID })
                                        .exec()
                                        .then(function (curFriends) {
                                            if (curFriends) {
                                                var curListOfFriends = curFriends.profiles;
                                                if (curListOfFriends) {
                                                    for (var i = 0; i < curListOfFriends.length; i++) {
                                                        //console.log(curListOfFriends[i].profileID, profileID);
                                                        if (curListOfFriends[i].profileID.equals(profileID)) {
                                                            //console.log("ahhhhhhhhh");
                                                            curListOfFriends.splice(i, 1);
                                                        }
                                                    }
                                                    console.log("\n\n", curFriends);
                                                    curFriends.save().then(result => {
                                                        console.log("friends are all deleted")
                                                    }).catch(err => res.status(500).json({
                                                        error: err,
                                                        message: "Error occured when deleting friends"
                                                    }));
                                                }
                                            }
                                        }).catch(err => {
                                            return res.status(500).json({
                                                error: err,
                                                message: "Error occur when deleting friend"
                                            })
                                        })
                                    console.log(curProfileID);
                                }
                                //console.log(listOfFriends);
                            }
                        }
                    })

                Post.find({ profileID: profileID })
                    .exec()
                    .then(function (posts) {
                        if (posts) {
                            for (var i = 0; i < posts.length; i++) {
                                var curPostID = posts[i]._id;
                                Post.deleteOne({ _id: curPostID })
                                    .exec()
                                    .then(result => {
                                        console.log("current post deleted");
                                    }).catch(err => {
                                        return res.status(500).json({
                                            error: err,
                                            message: "Error occur when deleting posts"
                                        })
                                    })
                                //console.log(posts[i]._id);
                                Poll.find({ postID: curPostID })
                                    .exec()
                                    .then(function (polls) {
                                        for (var i = 0; i < polls.length; i++) {
                                            Poll.deleteOne({ _id: polls[i]._id })
                                                .exec()
                                                .then(result => {
                                                    console.log("current poll deleted");
                                                }).catch(err => {
                                                    return res.status(500).json({
                                                        error: err,
                                                        message: "Error occur when deleting polls"
                                                    })
                                                })
                                        }
                                        //console.log(polls);
                                    })
                            }
                        }
                    }).catch(err => {
                        return res.status(500).json({
                            error: err
                        })
                    });
            }
        }).catch(err => {
            return res.status(500).json({
                error: err,
            })
        });
    return res.status(200).json({
        message: "all user data has been deleted!",
    })
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

        user.save().then(result => {
            console.log(result)
        }).catch(err => {
            return res.status(401).json({
                message: "something is wrong when changing the authorization",
            });
        })

        return res.status(200).json({
            Authentication: 'OKAY',
            token: jwtToken
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error'
        });
    }
}   