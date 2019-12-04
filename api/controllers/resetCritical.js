
const User = require("../models/user");
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const bcrypt = require("bcrypt");




exports.confirm_psw = (req, res, next) => {

    User.findOne({ _id: req.userData.userID }, function (err, user) {
        if (err){
            console.log(err);
        }
        if (!user) {
            return res.status(401).json({
                message: "User validation Failed",
            });
        }
        var isPasswordValid = bcrypt.compareSync(req.body.password, user.password);

        if (!isPasswordValid) {
            //return an error if password is incorrect
            return res.status(401).json({
                message: 'Your input password is not correct!'
            });
        } else {
            return res.status(200).json({
                message: "validation success!",
            })
        }
    })
}


exports.reset_psw = (req, res, next) => {
    User.findOne({ _id: req.userData.userID }, function (err, user) {
        if (!user) {
            return res.status(401).json({
                message: "User validation Failed",
            })
        }
        if(req.body.password.length < 8){
            return res.status(401).json({
                message: 'Password length too short'
            })
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        user.password = hash;
        user.captcha = true;
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
        });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({
            message: "User is not find",
            error: err
        })
    });
}

exports.send_email_val_vode = (req, res, next) => {
    async.waterfall([
        function (done) {
            User.findOne({ _id: req.userData.userID })
                .exec()
                .then(user => {
                    // if user does not exist, shows an error
                    if (!user) {
                        return res.status(401).json({
                            message: "User Validation Failed!"
                        });
                    }
                    if (user.email != req.body.email){
                        return res.status(401).json({
                            message: "Current Email invalid!",
                        });
                    }
                    var i;
                    var varificationCode = ""
                    for(i = 0; i < 6; i++){
                        var x = Math.floor((Math.random() * 10) + 1);
                        varificationCode += x.toString();
                    }
                    user.resetEmailToken = varificationCode; 
                    user.resetEmailExpires = Date.now() + 3600000; // 1 hour
                    
                    
                    user.save(function (err){
                        done(err, varificationCode, req.body.email);
                    })
                })
                .catch(err => {
                    console.log(err);
                    return res.status(500).json({
                        error: err,
                        message: "Something is wrong!",
                    });
                });
        },
        function (varificationCode, email, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'goldenexperiencemudamudamuda@gmail.com',
                    pass: 'alan987g'
                }
            });
            var mailOptions = {
                to: email,
                from: 'goldenexperiencemudamudamuda@gmail.com',
                subject: 'HoosierConnection Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the email for your Hoosier Connection account.\n\n' +
                    'Please copy the following code to complete the process:\n\n' +
                    varificationCode + '\n\n' +
                    'If you did not request this, please ignore tshis email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                if (err) {
                    return res.status(500).json({
                        message: "email sending failed"
                    });
                } else {
                    done(err, 'done');
                }
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.status(200).json({
            message: "Done"
        });
    });
}


exports.reset_email = (req, res, next) => {

    User.findOne({_id: req.userData.userID, resetEmailExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            return res.status(401).json({
                message: "User Validation Failed"
            });
        }
        if(user.resetEmailToken === req.body.resetEmailToken){
            user.email = req.body.email;
            user.resetEmailToken = undefined;
            user.resetEmailExpires = undefined;
            user.captcha = true;
            user.save()
            .catch(err => {
                console.log(err);
                return res.status(500).json({
                    message: "save is not successful",
                    error: err
                })
            });
            return res.status(200).json({
                message: "Email reset successful"
            });
        }
    }).catch(err => {
        console.log(err);
        return res.status(500).json({
            message: "User not find or code expired, please try again",
            error: err
        })
    });
}