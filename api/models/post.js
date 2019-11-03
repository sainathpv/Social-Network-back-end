const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
    },
    numLikes: Number, 
    name: {type: String, require: true},
    numDislikes: Number,
    tags: {type: Array, require: true},
    title: {type: String, require: true},
    type: {type: String, require: true},
    content: {type: String, require: true}
});


module.exports = mongoose.model('Post', postSchema);