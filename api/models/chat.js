const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    chatName: {type: String, require: true},
    users: {type: Array, default: []},
    messages: {type: Array, default: []}
});

module.exports = mongoose.model('Chat', chatSchema);