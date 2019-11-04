const mongoose = require('mongoose');

const userPostSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    question: { type: String, required: true },
    questionType: { type: String, required: true },
    userPostImage: { type: String }
});

module.exports = mongoose.model('UserPost', userPostSchema);
