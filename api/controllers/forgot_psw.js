const User = require("../models/user");
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const bcrypt = require("bcrypt");


exports.forgot_pwd_getQuestions = async (req, res, next) => {
    try {

        var user = await User.findOne({ email: req.params.email }).exec();
        console.log(user);
        if (user === null) {
            return res.status(404).json({
                message: "NOT FOUND"
            });
        } else {
            var questions = [];
            for (var i = 0; i < 3; i++) {
                questions.push(user.questions[i].question);
            }

            res.status(200).json({
                questions: questions
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: "ERROR"
        });
    }
}

exports.forgot_psw_questions = async (req, res, next) => {

    var user = await User.findOne({ email: req.body.email }).exec();
    if (user === null) {
        return res.status(401).json({
            message: "UNAUTHORIZED"
        });
    } else {
        var matches = 0;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (req.body.questions[i].question === user.questions[j].question) {
                    var anwserCorrectness =
                        bcrypt.compareSync(req.body.questions[i].answer,
                            user.questions[j].answer);
                    if (anwserCorrectness) {
                        if (++matches == i + 1) {
                            if (i == 2) {
                                crypto.randomBytes(20, function (err, buf) {
                                    var token = buf.toString('hex');
                                    user.resetPswToken = token;
                                    user.resetPswExpires = Date.now() + 3600000; // 1 hour
                                    user.save().then(result => {
                                        return res.status(200).json({
                                            token: token
                                        });
                                    }).catch(err => {
                                        console.log(err);
                                        return res.status(500).json({ error: "ERROR" });
                                    });
                                });
                            }
                        } else {
                            return res.status(401).json({
                                message: "UNAUTHORIZED"
                            });
                        }
                    } else {
                        return res.status(401).json({
                            message: "UNAUTHORIZED"
                        });
                    }
                }
            }
        }
    }
}

exports.forgot_psw_email = (req, res, next) => {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email })
                .exec()
                .then(user => {
                    // if user does not exist, shows an error
                    if (!user) {
                        return res.status(401).json({
                            message: "The input email is invalid"
                        })
                    }
                    else {
                        user.resetPswToken = token;
                        user.resetPswExpires = Date.now() + 3600000; // 1 hour
                    }

                    // if something wrong in general, shows an error

                    user.save(function (err) {
                        done(err, token, user);
                    });
                })
                .catch(err => {
                    console.log(err);
                    return res.status(500).json({ error: err })
                });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'goldenexperiencemudamudamuda@gmail.com',
                    pass: 'alan987g'
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'goldenexperiencemudamudamuda@gmail.com',
                subject: 'HoosierConnection Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://hoosierconnection.org/ResetPassword/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
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

exports.forgot_psw_reset = (req, res, next) => {

    User.findOne({ resetPswToken: req.body.token, resetPswExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {

            return res.status(401).json({
                message: "Email is not valid"
            })
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        user.password = hash;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
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
            message: "nothing is find",
            error: err
        })
    });
}


