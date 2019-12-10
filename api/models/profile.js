const mongoose = require('mongoose');

const ProfileSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true,
    unique: true
  },  
  accountType: String,
  profileImageUrl: {
    type: String,
    default: '/assets/images/profiles/default.jpg'
  }, //This is the image name of the user profile image. The actual image is stored in the profileImg
  
  name: {type: String, require: true, public: true,},
  major: {type: String, default: "" }, 
  studentType: {type: String, default: "" },
  year: {type: String, default: "" }, 
  bio: {type: String, default: "" },//This will be the user's info (bibliography).
  interests: {type: Array, default: []}, //Array of Strings
  posts: {type: Array, default: []}, //Array of Strings
  events: {type: Array, default: []}, //Array of EventIDs
  friends: {type: Array, default: []}, //Array of JSON Data with profileIDs and request state
  chats: {type: Array, default: []}, //Array of chatIDs
  settings: {type: Object, default: {
    darkmode: false,
    postsSeenOnlyByFriends: false,
    censor: false
  }},
  hided: {type: Object, default: {
    trueName: false,
    name: false,
    major: false, 
    studentType: false, 
    year: false, 
    interests: false, 
  }}
});

module.exports = mongoose.model('Profile', ProfileSchema);
