const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    numLikes: Number, 
    numDislikes: Number,
    tags: String,
    title: {type: String, require: true},
    content: {type: String, require: true},
    images: String, 
    videos: String,
});


module.exports = mongoose.model('Post', postSchema);