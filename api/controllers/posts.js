const Post = require('../models/post');
const mongoose = require('mongoose');
const Profile = require('../models/profile');
const Poll = require('../models/poll');
exports.posts_post = async (req, res, next) => {
    try{
        var tags = req.body.tags.toLowerCase();

        var profile = await Profile.findOne({ user: req.userData.userID }).catch(err => { 
            console.log(err);
            return res.status(500)
        });
        var content;
        if (req.body.type === "post"){

            var share = await Post.findById(req.body.content).exec();
            if (share === null) {
                return res.status(400).json({
                    message: "Malformed"
                });
            }

            if (share.type === "post") {
                content = share.content;
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
                tags: tags,
                title: req.body.title,
                type: req.body.type,
                content: content
            });


            profile.posts.push(post._id);
            var save2 = await profile.save();
            var save3 = await post.save();
            return res.status(200).json({
                message: "Post created"
            });
        } else {
            var content; 
            var poll;
            if(req.body.type === "poll"){
                poll = new Poll({
                    _id: new mongoose.Types.ObjectId(),
                    categories: req.body.categories.map((category, i) => {
                        return {
                            category: category,
                            votes: 0
                        };
                    }),
                    postID: ""
                });
                content = poll._id;
            }else if(req.body.type === "video"){
                content = "https://www.youtube.com/embed/" + req.body.content.split("=")[1];
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
                tags: tags,
                title: req.body.title,
                type: req.body.type,
                content: content
            });
            
            if(req.body.type === "poll"){
                poll.postID = post._id;
                var save = await poll.save();
            }

            profile.posts.push(post._id);
            var save1 = await profile.save();
            var save2 = await post.save();

            return res.status(200).json({
                message: "Post created"
            });
        }
    }catch(error){
        res.status(500).json({
            message: "ERROR"
        });
    }
}

exports.posts_getByID = (req, res, next) => {
    Post.findById(req.params.id).exec().then(post => {
        if (post === null) {
            return res.status(400).json({
                message: "Malformed"
            });
        }
        return res.status(200).json(post);
    }).catch(err => { res.status(500).json({ error: err }); console.log(err); });
}

// This is the helper for getPosts router after this function
function getPost(tags, listOfPost, i, length, callback) {
    Post.find({ tags: tags[i].toLowerCase() })
        .populate("post")
        .exec()
        .then(result => {
            listOfPost = listOfPost.concat(result)
            if (i == (length - 1) || -1 == (length - 1)) {
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
    Post.findById(req.params.postID).exec().then(post => {
        Profile.findOne({ user: req.userData.userID }).exec().then(profile => {
            var vote;

            //Find if the user has voted
            for (var i = 0; i < post.votes.length; i++) {
                if (post.votes[i].profileID.toString() === profile._id.toString()) {
                    vote = post.votes[i];
                    console.log("Vote")
                    console.log(vote.vote)
                    return res.status(200).json({
                        vote: vote.vote.toString()
                    })
                }
            }
            //if not voted
            console.log("NO VOTE")
            console.log(vote)
            return res.status(200).json({
                vote: '0'
            });

        }).catch(err => {
            console.log(err);
            return res.status(204).json({
                vote: '0'
            });
        });

    }).catch(err => {
        return res.status(204).json({
            vote: '0'
        });
    });
}

exports.posts_vote = async (req, res, next) => {
    Post.findById(req.body.postID).exec().then(post => {
        Profile.findOne({ user: req.userData.userID }).exec().then(profile => {
            var vote;

            //Find if the user has voted
            for (var i = 0; i < post.votes.length; i++) {
                if (post.votes[i].profileID.toString() === profile._id.toString()) {
                    vote = post.votes[i];
                    vote.vote = req.body.vote % 2;
                    post.votes[i] = vote;
                    break;
                }
            }

            //if not voted
            if (vote === undefined) {
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
                if (vote.vote === 1) {
                    likes++;
                } else {
                    dislikes++;
                }
            });

            post.numDislikes = dislikes;
            post.numLikes = likes;
            post.markModified('votes');
            post.save().then(result => {
                return res.status(200).json({
                    numDislikes: dislikes,
                    numLikes: likes
                });
            }).catch(err => { res.status(500).json({ error: err }) });

        }).catch(err => {
            return res.status(500).json({
                error: err
            });
        });

    }).catch(err => {
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
            res.status(500).json({ error: err });
        });
        return res.status(200).json({
            message: "OKAY"
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err })
    });
}

exports.posts_votePoll = async (req, res, next) => {
    try{

        var profile = await Profile.findOne({user: req.userData.userID }).catch(err => { 
            console.log(err);
            return res.status(500);
        });

        var poll = await Poll.findById(req.body.pollID).catch(err => { 
            console.log(err);
            return res.status(500);
        });

        //Find if the user has voted
        poll.categories.map((category, i) => {
            category.votes = 0;
        });

        var voted = false;
        poll.votes.map((vote, i) => {
            if(profile._id.toString() === vote.profileID.toString()){
                vote.category = req.body.category;
                voted = true;
            }
            poll.categories.map((category, i) => {
                if(category.category === vote.category){
                    category.votes += 1;
                }
            });
        });

        if(!voted){
            var vote = {
                category: req.body.category,
                profileID: profile._id
            };

            poll.votes.push(vote);
            poll.categories.map((category, i) => {
                if(category.category === req.body.category){
                    category.votes += 1;
                }
            });
        }

        poll.markModified('votes');
        poll.markModified('categories');

        var save = poll.save();

        return res.status(200).json({
            message: "OKAY"
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "ERROR"
        });
    }
}

exports.posts_getVotePoll = async (req, res, next) => {
    try{
        var profile = await Profile.findOne({user: req.userData.userID}).catch(err => { 
            console.log(err);
            return res.status(500)
        });
        var poll = await Poll.findById(req.params.pollID).catch(err => { 
            console.log(err);
            return res.status(500)
        });
    
        for (var i = 0; i < poll.votes.length; i++) {
            if (poll.votes[i].profileID.toString() === profile._id.toString()) {
                return res.status(200).json({
                    voted: true,
                    categories: poll.categories
                });
            }
        }
        return res.status(200).json({
            voted: false,
            categories: poll.categories
        });
    }catch(error){
        return res.status(500).json({
            message: "ERROR"
        });
    }
}

exports.posts_getPoll = async (req, res, next) => {
    try{
        var poll = await Poll.findById(req.params.pollID).catch(err => { 
            console.log(err);
            return res.status(500)
        });
        if(poll === null){
            return res.status(404).json({
                message: "ERROR"
            });
        } 

        var data = {
            values: poll.categories.map((category, i) => category.votes),
            labels: poll.categories.map((category, i) => category.category),
            type: 'pie'
        };

        var datas = [];
        datas.push(data);
        return res.status(200).json({
            data: datas
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message: "ERROR"
        });
    }
}