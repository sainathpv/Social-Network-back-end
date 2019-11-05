const express = require("express");
const router = express.Router();
const User = require("../models/user");
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

router.post("/forget_psw_email",  (req, res, next) => {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({email: req.body.email})
            .exec()
            .then(user => {
                // if user does not exist, shows an error
                if ( !user || user.length >=2 ) {
                    return res.status(401).json({
                        message: "The input email is invalid"
                    })
                }
                else {
                    user.resetPswToken = token;
                    user.resetPswExpires = Date.now() + 3600000; // 1 hour
                    console.log(typeof Date.now())
                }
            
            // if something wrong in general, shows an error

            user.save(function(err) {
                done(err, token, user);
              });
            })
            .catch(err => {
                console.log(err);
                return res.status(500).json({error: err})
            });
        },
        function(token, user, done) {
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
                text:   'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + "localhost:3000" + '/ResetPassword/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    };
            smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                    return res.status(500).json({
                        message: "email sending failed"
                    })
                } else {
                    
                    done(err, 'done');
                }
          });
        }
      ], function(err) {
        if (err) return next(err);
        res.status(200).json({
            message: "Done"
        })
      });
    });

module.exports = router;