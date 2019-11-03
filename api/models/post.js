const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
    },
    numLikes: Number, 
    numDislikes: Number,
    tags: String,
    title: {type: String, required: true},
    content: {type: String, required: true},
    images: String, 
    videos: String,
});


module.exports = mongoose.model('Post', postSchema);