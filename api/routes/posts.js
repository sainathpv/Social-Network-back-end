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
  destination: function (req, file, cb) {
    cb(null, 'staticAssets/images/posts');
  },
  filename: function (req, file, cb) {
    fileName = req.body.userID + file.originalname;
    cb(null, fileName);
  }
});

const fileFilter = function (req, file, cb) {
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


// add back the middleware!!!!
router.post('/postPosts', upload.single('postImg'),
  async (req, res, next) => {
    try {
      const post = new Post({
        _id: new mongoose.Types.ObjectId(),
        profileId: req.body.profileId, //this req can be changed due to the front end requirement
        commentID: [],
        numLikes: 0,
        numDislikes: 0,
        tags: req.body.tags,
        title: req.body.title,
        content: req.body.content,
        images: fileName,
        videos: req.body.video
      });

      post.save().then(result => {
        console.log(result)
        return res.status(200).json({
          message: "Post created",
        });
      }).catch(err => {
        console.log(err)
        return res.status(409).json({
          message: "post Failed"
        });
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        message: 'Server error'
      });
    }
  });

// This is the helper for getPosts router after this function
function getPost(tags, listOfPost, i, length, callback) {
  Post.find({ tags: tags[i] })
    .populate("post")
    .exec()
    .then(result => {
      console.log(result)
      listOfPost = listOfPost.concat(result)
      if (i == length - 1) {
        console.log(i)
        callback(listOfPost)
      } else {
        getPost(tags, listOfPost, i + 1, length, callback);
      }
    })
    .catch(err => {
      console.log(err);
      return "Something is wrong when getting all the post";
    });
}

// add back the middleware !!!!!
router.get('/getPosts', async (req, res, next) => {
  var listOfTags = req.body.tags;
  var listOfPost = []
  try {
    var i = 0;
    getPost(listOfTags, listOfPost, i, listOfTags.length, function (result) {
      listOfPost = listOfPost.concat(result)
      res.status(200).json({
        return: listOfPost
      })
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: 'Server error'
    });
  }
});

router.get("/getComments", async (req, res, next) => {

})



module.exports = router;
