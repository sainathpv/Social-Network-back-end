const mongoose = require('mongoose');

const ProfileSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  profileImageUrl: {
    type: String,
    default: '/assets/images/profiles/default.jpg'
  }, //This is the image name of the user profile image. The actual image is stored in the profileImg
  bio: String, //This will be the user's info (bibliography).
  interests: {
    type: [String],
    enum: ['gaming', 'coding', 'anime', 'food', 'music', 'computer-science']
  }, // this should be a array of strings, each string represents a tag
  major: String, // user's major
  friends: [mongoose.Schema.Types.ObjectId]
});

module.exports = mongoose.model('Profile', ProfileSchema);
