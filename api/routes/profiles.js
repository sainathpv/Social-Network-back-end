const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const multer = require("multer");
const Profile = require('../models/profile');
const User = require("../models/user");
const check2Auth = require('../middleware/check-2auth');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '.../postImg/')
    }, 
    filename: function(req, file, cb){
        var today = new Date();
        var date = today.getFullYear()+'_'+(today.getMonth()+1)+'_'+today.getDate();
        var time = today.getHours() + "-" + today.getMinutes();
        var dateTime = date + "(" + time + ")";

        cb(null, dateTime + file.originalname);
    }
})

const fileFilter = function(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.post('/editprofile', check2Auth, upload.single('profilePicture'), (req, res, next) => {
    Profile.update({'_id': req.userData.profileid}, 
    {$set: 
        {
            'profileImage': req.file.path,
            'bio': req.body.bio,
            'tags': req.body.tags,
            'major': req.body.major
        }
    }).exec()
      .then(
        result => {
            res.status(201).json({
                'image_url': result.profileImage,
                'bio': result.bio,
                'tags': result.tags,
                'major': result.major
            });
        }
      ).catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
});

router.get('/profile/:profileid', check2Auth, (req, res, next) => {
    Profile.findOne({'_id':req.params.profileid})
           .exec()
           .
});

module.exports = router;