const mongoose = require('mongoose');

const pollSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    postID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        require: true,
    },
    votes: {type: Array, default: []},
    categories: {type: Array, default: []}
});


module.exports = mongoose.model('Poll', pollSchema);