const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    profileID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        require: true,
    },
    postID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        require: true,
    },
    numLikes: Number, 
    numDislikes: Number,
    content: {type: String, require: true},
    images: String, 
    videos: String

});


module.exports = mongoose.model('Comment', commentSchema);