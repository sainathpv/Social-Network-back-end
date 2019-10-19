const mongoose = require('mongoose');

const userProfileSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: { 
        // this will be the connection with users, when user signup, a profile should be generated also
        // you can get user's first name and last name from this
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
        unique: true
    }, 
    profileIMG: String, //This is the image name of the user profile image. The actual image sistored in the profileImg
    basicInfo: String, //This will be the user's info (bibliography).
    tags: Array, // this should be a array of strings, each string represent a tag
    major: String, // user's major
});


module.exports = mongoose.model('Profile', userProfileSchema);