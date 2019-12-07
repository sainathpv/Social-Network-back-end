const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  accountType: {type: String, require: true},
  company: String,
  userName: {type: String, require: true},
  trueName: {type: String},
  password: {type: String, required: true },
  // Email has clear format by using match
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  },
  // this will be a string and only gets updated by the twoFA.js (could be issue tho because people can actually update this from users.js when they sign up)
  twoFASecret: {
    type: String
  },
  questions: {type: Array, default: []},
  captcha: {type: Boolean, default: false},
  resetPswToken: { type: String },
  resetPswExpires: { type: Date },
  resetEmailToken: {type: String},
  resetEmailExpires: {type: Date},
  authorization: {type: Boolean, required: true}
});

module.exports = mongoose.model('User', userSchema);
