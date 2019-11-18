const mongoose = require('mongoose');

const friendsSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  profileID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    require: true
  },
  profiles: {type:Array, require:true, default:[]}
});

module.exports = mongoose.model('Friends', friendsSchema);
