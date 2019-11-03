const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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