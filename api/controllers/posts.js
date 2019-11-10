const Post = require('../models/post');
const mongoose = require('mongoose');

exports.posts_post = async (req, res, next) => {
    try {
      var content;
      if(req.body.type === "image"){
        //Need help with this
      }else if(req.body.type === "video"){
        content = "https://www.youtube.com/embed/" + req.body.content.split("=")[1];
      }else{
        content = req.body.content;
      }
  
      const post = new Post({
        _id: new mongoose.Types.ObjectId(),
        profileID: req.body.profileID, 
        comments: [],
        numLikes: 0,
        name: req.body.name,
        numDislikes: 0,
        tags: req.body.tags,
        title: req.body.title,
        type: req.body.type,
        content: content
      });
  
      post.save().then(result => {
        return res.status(200).json({
          message: "Post created"
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
}

// This is the helper for getPosts router after this function
function getPost(tags, listOfPost, i, length, callback) {
    Post.find({ tags: tags[i] })
      .populate("post")
      .exec()
      .then(result => {
        
        listOfPost = listOfPost.concat(result)
        if (i == length - 1 || -1 == length -1) {
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

exports.posts_get = async (req, res, next) => {
    console.log(JSON.parse(req.query.tags));
    var listOfTags = JSON.parse(req.query.tags);
    var listOfPost = [];
    try {
      var i = 0;
      getPost(listOfTags, listOfPost, i, listOfTags.length, function (result) {
        listOfPost = listOfPost.concat(result)
        res.status(200).json({
          return: listOfPost
        });
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        message: 'Server error'
      });
    }
}

exports.posts_comment = async (req, res, next) => {
    Post.findById(req.body.postID).exec().then(post => {
      post.comments.push({
        comment: req.body.comment,
        user: req.body.user,
        profile: req.body.profile
      });
      post.save().catch(err => {
        console.log(err);
        res.status(500).json({error: err})
      });
      return res.status(200);
    }).catch(err => {
      console.log(err);
      res.status(500).json({error: err})
    });
}