const Post = require('../models/post');
const mongoose = require('mongoose');
const Profile = require('../models/profile');

exports.posts_post = async (req, res, next) => {
  console.log(req.body);
  var i = 1;
  Profile.findOne({user: req.userData.userID}).then( profile => {
    console.log("test" + i++);
    var content;
    if(req.body.type === "video"){
      content = "https://www.youtube.com/embed/" + req.body.content.split("=")[1];
    }else if(req.body.type === "post"){
      Post.findById(req.body.content).exec().then(result => {
        if(result === null){
          return res.status(400).json({
            message: "Malformed"
          });
        }

        if(result.type === "post"){
          content = result.content;
        }else{
          content = req.body.content;
        }

        
        const post = new Post({
          _id: new mongoose.Types.ObjectId(),
          profileID: profile._id, 
          comments: [],
          numLikes: 0,
          name: profile.name,
          numDislikes: 0,
          tags: req.body.tags,
          title: req.body.title,
          type: req.body.type,
          content: content
        });
        
        profile.posts.push(post._id);
        console.log(post);
        profile.save().then( result => {
          post.save().then(result => {
            return res.status(200).json({
              message: "Post created"
            });
          }).catch(err => { res.status(500).json({error: err}); console.log(err)});
        }).catch(err => { res.status(500).json({error: err}); console.log(err)});

      });
    }else{
      content = req.body.content;
      console.log(content);
      const post = new Post({
        _id: new mongoose.Types.ObjectId(),
        profileID: profile._id, 
        comments: [],
        numLikes: 0,
        name: profile.name,
        numDislikes: 0,
        tags: req.body.tags,
        title: req.body.title,
        type: req.body.type,
        content: content
      });
      
      profile.posts.push(post._id);

      profile.save().then( result => {
        post.save().then(result => {
          return res.status(200).json({
            message: "Post created"
          });
        }).catch(err => { res.status(500).json({error: err}); console.log(err)});
      }).catch(err => { res.status(500).json({error: err}); console.log(err)});
    }

  }).catch(err => { res.status(500).json({error: err}); console.log(err)});
}
exports.posts_getByID = (req, res, next) => {
  Post.findById(req.params.id).exec().then( post => {
    if(post === null){
      return res.status(400).json({
        message: "Malformed"
      });
    }
    return res.status(200).json(post);
  }).catch( err => { res.status(500).json({error: err}); console.log(err); });
}

// This is the helper for getPosts router after this function
function getPost(tags, listOfPost, i, length, callback) {
    Post.find({ tags: tags[i] })
    .populate("post")
    .exec()
    .then(result => {
        listOfPost = listOfPost.concat(result)
        if (i == length - 1 || -1 == length -1) {
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

exports.posts_getVote = async (req, res, next) => {
  Post.findById(req.params.postID).exec().then( post => {
    Profile.findOne({user: req.userData.userID}).then(profile => {
        var vote;
        //Find if the user has voted
        for(var i = 0; i < post.votes.length; i++){
            if(post.votes[i].profileID.toString() == profile._id.toString()){
                vote = post.votes[i];
                return res.status(200).json({
                  vote: vote.vote
                })
            } 
        }

        //if not voted
        if(vote === undefined){
          return res.status(204).json({
            vote: 0
          })
        } 

    }).catch(err => {
      return res.status(500).json({
        error: err
      });
    });
    
  }).catch( err => {
    return json.status(500).json({
      error: err
    });
  });
}

exports.posts_vote = async (req, res, next) => {
  Post.findById(req.body.postID).exec().then( post => {
    Profile.findOne({user: req.userData.userID}).exec().then(profile => {
        var vote;

        //Find if the user has voted
        for(var i = 0; i < post.votes.length; i++){
          if(post.votes[i].profileID.toString() == profile._id.toString()){
            vote = post.votes[i];
            vote.vote =  req.body.vote % 2;
            post.votes[i] = vote;
            break;
          } 
        }

        //if not voted
        if(vote === undefined){
            vote = {
                profileID: profile._id,
                vote: req.body.vote % 2
            };
            post.votes.push(vote);
        } 
        var likes = 0;
        var dislikes = 0;
        //update post
        post.votes.filter((vote) => vote.vote != 0).map((vote, i) => {
            if(vote.vote === 1){
                likes++;
            }else{
                dislikes++;
            }
        });
        
        post.numDislikes = dislikes;
        post.numLikes = likes;
        post.markModified('votes');
        post.save().then( result => {
            console.log(result);
            return res.status(200).json({
                numDislikes: dislikes,
                numLikes: likes
            });
        }).catch(err => {res.status(500).json({error: err})});

    }).catch(err => {
      return res.status(500).json({
        error: err
      });
    });
    
  }).catch( err => {
    return json.status(500).json({
      error: err
    });
  });
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
      return res.status(200).json({
        message: "OKAY"
      });
    }).catch(err => {
      console.log(err);
      res.status(500).json({error: err})
    });
}