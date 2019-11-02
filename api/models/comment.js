const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
        unique: true
    },
    numLikes: Number, 
    numDislikes: Number,
    content: {type: Mixed, require: true},

});


module.exports = mongoose.model('Comment', commentSchema);