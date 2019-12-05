const Profile = require('../models/profile');
const mongoose = require('mongoose');
const Chatkit = require('pusher-chatkit-server');

const chatkit = new Chatkit.ChatManager({
    instanceLocator: "v1:us1:5a64b818-5ec9-4f14-b3dc-c14a1fb11ff4",
    key: "282d3cd3-acbf-4371-9951-33042b09fa60:JpaalLQk3ugZrCA+Fye54oVcxSFQG3+rKQsXaLqI/zM="
});

exports.chat_auth = (req, res, next) => {
    var profile = Profile.findOne({user: req.body.userID});
    const authData = chatkit.authenticate({ userId: profile.userName });
    return res.status(authData.status).send(authData.body);
}