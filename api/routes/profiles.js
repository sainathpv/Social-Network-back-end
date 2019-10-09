const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const multer = require("multer");
const Profile = require('../models/profile');
const User = require("../models/user");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './profileImg/')
    }, 
    filename: function(req, file, cb){
        var today = new Date();
        var date = today.getFullYear()+'_'+(today.getMonth()+1)+'_'+today.getDate();
        var time = today.getHours() + "-" + today.getMinutes();
        var dateTime = date+ "(" +time + ")";

        cb(null, 
            dateTime + file.originalname);
    }
})

const fileFilter = function(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const imgUpload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

module.exports = router;