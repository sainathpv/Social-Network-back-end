const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
        unique: true
    },
    commentID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment", 
        unique: true
    }],
    numLikes: Number, 
    numDislikes: Number,
    tags: {type: Array,},
    title: {type: String, require: true},
    content: {type: Mixed, require: true},

});


module.exports = mongoose.model('Post', postSchema);