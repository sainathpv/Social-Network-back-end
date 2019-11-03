const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/post');
const Comment = require('../models/comment')
const mongoose = require('mongoose');
const check2Auth = require('../middleware/check-2auth');
const fs = require("fs")

//The following code are for uploading images
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var fileName = ""

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'staticAssets/images/comments');
  },
  filename: function(req, file, cb) {
    fileName = req.body.userID + file.originalname;
    cb(null, fileName);
  }
});

const fileFilter = function(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



// this is for posting comments, please add the middleware if it is required. 
// For test purposes, I removed them
router.post('/postComments', upload.single('commentImg'),
  async (req, res, next) => {
    try {
        //created the new comments
        const comment = new Comment({
            _id: new mongoose.Types.ObjectId(),
            userID: req.body.userID, //this req can be changed due to the front end requirement
            postID: req.body.postID, 
            numLikes: 0, 
            numDislikes: 0,
            content: req.body.content,
            images: fileName,
            videos: req.body.videos // I actually don't know how to edit this. Will do some research later
        });

        // save the comment to the schema
        comment.save().then(result => {
            console.log(result)
            return res.status(200).json({
            message: "comment created"
            });
        }).catch(err => { //return error if there are any
            console.log(err)
            return res.status(409).json({
            message: "comment failed"
            });
        });
    }catch (error){ // return error if there are any error in general
        console.log(error)
        return res.status(500).json({
            message: 'Server error'
        });
        }
});

// get the comment according to post ID
router.get('/getComments', async (req, res, next) => {
    try {
        console.log(req.body.postID)
        Comment.find({postID: req.body.postID}) // this get method only take postID in req
        .populate("comment")
        .exec()
        .then(result =>{
            //return the comments if found
            console.log(result)
            res.status(200).json({
                return: result
            })
        }).catch(err=>{
            console.log(err)
            res.status(409).json({
                message: "comments not find"
            })
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            message: 'Server error'
        });
    }
});


module.exports = router;