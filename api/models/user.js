const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    password: { type: String, required: true },

    // Email has clear format by using match
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        //userImage: {type: String, required: true}
    },

    // this will be a string and only gets updated by the twoFA.js (could be issue tho because people can actually update this from users.js when they sign up)
    twoFASecret: {
        type: String
    },
    resetPswToken: { type: String },
    resetPswExpires: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
