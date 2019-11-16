const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    profileID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        require: true,
    },
    numLikes: Number, 
    name: {type: String, require: true},
    numDislikes: Number,
    comments: {type: Array, default: []},
    tags: {type: Array, require: true},
    title: {type: String, require: true},
    type: {type: String, require: true},
    votes: {type: Array, default: [] }, //{profileID: id, vote: -1/0/1 }
    content: {type: String, require: true}
});


module.exports = mongoose.model('Post', postSchema);