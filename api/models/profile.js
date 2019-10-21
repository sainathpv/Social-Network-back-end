const mongoose = require('mongoose');

const userProfileSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	userid: {
		// this will be the connection with users, when user signs up, a profile should also be generated
		// you can get user's first name and last name from this
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		unique: true
	},
	profileImage: String, //This is the image name of the user profile image. The actual image is stored in the profileImg
	bio: String, //This will be the user's info (bibliography).
	tags: Array, // this should be a array of strings, each string represent a tag
	major: String // user's major
});

module.exports = mongoose.model('Profile', userProfileSchema);
