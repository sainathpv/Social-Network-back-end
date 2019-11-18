const mongoose = require('mongoose');
const friends = require('../models/friends');
const profile = require('../models/profiles');

exports.friends_create = (req, res, next) => {
  try {
    profile.findOne({ user: req.UserData.userID }).then(profile => {
      const friends = new friends({
        _id: new mongoose.Types.ObjectId(),
        profileID: profile._id
      });
      profile.friends = friends._id;
      profile.save().then(result => {
        friends.save().then(result => {
          return res.status(200).json({
            message: 'You have a new friend'
          });
        });
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

exports.friends_get = (req, res, next) => {
  try {
    profile.findOne({ user: req.UserData.userID }).then(profile => {
      friends
        .findById(profile.friends)
        .exec()
        .then(friends => {
          res.status(200).json({
            message: friends
          });
        });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

exports.friends_edit = (req, res, next) => {
  try {
    profile.findOne({ user: req.UserData.userID }).then(profile => {
      friends
        .findById(profile.friends)
        .exec()
        .then(friends => {
          for (i = 0; i < friends.friends.length; i++) {
            if (friends.friends[i]._id.toString() == req.body.friend.friendID) {
              if (
                (req.body.friend.status == 'rejected' &&
                  friends.friends[i].status == 'requestor') ||
                friends.friends[i].status == 'requestee'
              ) {
                profile
                  .findOne(req.body.friend.friendID)
                  .exec()
                  .then(friendprofile => {
                    friends
                      .findById(profile.friends)
                      .exec()
                      .then(otherfriends => {
                        for (i = 0; i < otherfriends.friends.length; i++) {
                          if (
                            otherfriends.friends[i].friendID.toString() ==
                            friends._id.toString()
                          ) {
                            otherfriends.friends[i].splice(i, 1);
                          }
                        }
                      });
                  });
                friends.friends[i].splice(i, 1);
              } else if (
                (req.body.friend.status == 'accepted' &&
                  friends.friends[i].status == 'requestor') ||
                friends.friends[i].status == 'requestee'
              ) {
                friends.friends[i].status = 'accepted';
                profile
                  .findOne(req.body.friend.friendID)
                  .exec()
                  .then(friendprofile => {
                    friends
                      .findById(profile.friends)
                      .exec()
                      .then(otherfriends => {
                        for (i = 0; i < otherfriends.friends.length; i++) {
                          if (
                            otherfriends.friends[i].friendID.toString() ==
                            friends._id.toString()
                          ) {
                            otherfriends.friends[i].status = 'accepted';
                          }
                        }
                      });
                  });
              } else if (
                req.body.friend.status == 'removed' &&
                friends.friends[i].status == 'accepted'
              ) {
                profile
                  .findOne(req.body.friend.friendID)
                  .exec()
                  .then(friendprofile => {
                    friends
                      .findById(friendprofile.friends)
                      .exec()
                      .then(otherfriends => {
                        for (i = 0; i < otherfriends.friends.length; i++) {
                          if (
                            otherfriends.friends[i].friendID.toString() ==
                            friends._id.toString()
                          ) {
                            otherfriends.friends[i].splice(i, 1);
                          }
                        }
                      });
                  });
                friends.friends[i].splice(i, 1);
              }
            } else {
              profile
                .findOne(req.body.friend.friendID)
                .exec()
                .then(friendprofile => {
                  friends
                    .findById(friendprofile.friends)
                    .exec()
                    .then(otherfriends => {
                      otherfriends.friends.push({
                        friendID: profile._id,
                        status: 'requestee'
                      });
                      friends.friends.push({
                        friendID: otherfriends._id,
                        status: 'requestor'
                      });
                    });
                });
            }
          }
        });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Server error'
    });
  }
};
