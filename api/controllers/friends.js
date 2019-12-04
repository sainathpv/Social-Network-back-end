const mongoose = require('mongoose');
const Friend = require('../models/friends');
const Profile = require('../models/profile');

exports.friends_get = async (req, res, next) => {
    try {
        var profile = await Profile.findOne({ user: req.userData.userID }).exec();
        var friends = await Friend.findById(profile.friends).exec();
        //updateFriendProfiles(friends);
        return res.status(200).json({
            friends: friends
        });

    } catch (error) {

        res.status(500).json({
            message: 'Server error'
        });
    }
};

async function updateFriendProfiles(friends){
    for(var i = 0; i < friends.profiles.length; i++){
        var profile = await Profile.findById(friends.profiles[i].profileID).exec().catch(err => {
            console.log("ERROR WHEN UPDATING FRIENDS");
        })
        friends.profiles[i].profileIMG = profile.profileImageUrl;
        friends.markModified('profiles');
        var save = await friends.save();
    }
}


exports.friends_requestFriendWithUserName = async (req, res, next) => {
    try{
        var profile = await Profile.findOne({ user: req.userData.userID }).exec();
        var friends = await Friend.findById(profile.friends).exec();
        var otherProfile = await Profile.findOne({name: req.body.userName});
        if(otherProfile === null) {
            return res.status(404).json({
                message: "NOT FOUND"
            });
        }
        return await sendFriendRequest(res, profile, friends, otherProfile._id);
    }catch(error){
        console.log(error);
        res.status(500).json({
            message: "ERROR"
        });
    }
}

//The friends is from the perspective of its owner ie. when it is 'requestee'
//the associated profile is being sent the friend request
exports.friends_edit = async (req, res, next) => {
    try {
        var profile = await Profile.findOne({ user: req.userData.userID }).exec();
        var friends = await Friend.findById(profile.friends).exec();

        for (i = 0; i < friends.profiles.length; i++) {
            if (friends.profiles[i].profileID.toString() === req.body.friend.profileID.toString()){
                //reject friend only if requestee
                if (req.body.friend.status === 'rejected' && friends.profiles[i].status === 'requestee'){
                    return await modifyFriendStatus(res, friends, req.body.friend, 'rejected', i);
                //accept friend only if requestee
                } else if (req.body.friend.status === 'accepted' && friends.profiles[i].status === 'requestee'){
                    return await modifyFriendStatus(res, friends, req.body.friend, 'accepted', i);
                //remove friend only if accepted or requester
                } else if (req.body.friend.status === 'removed' && (friends.profiles[i].status === 'accepted'
                                                                ||  friends.profiles[i].status === 'requester')){
                    return await modifyFriendStatus(res, friends, req.body.friend, 'removed', i);
                }
            }   
        }
        //If no relationship exists send a friend request
        return await sendFriendRequest(res, friends, req.body.friend.profileID);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Server error'
        });
    }
};

async function sendFriendRequest(res, profile, requester, requestee){
    try{
        var otherProfile = await Profile.findOne(requestee).exec();
        var otherFriends = await Friend.findById(otherProfile.friends).exec();

        //adds the friend's infomation to both Friends objects
        otherFriends.profiles.push({
            profileID: requester.profileID, //used to access profile info
            friendID: requester._id, //used to access friend info
            name: profile.name, //these two prevent addition requests to the server
            profileIMG: profile.profileImageUrl,
            status: 'requestee'
        });

        requester.profiles.push({
            profileID: requestee,
            friendID: otherFriends._id,
            name: otherProfile.name,
            profileIMG: otherProfile.profileImageUrl,
            status: 'requestor'
        });

        //ensuring update
        requester.markModified('profiles');
        otherFriends.markModified('profiles');

        var save1 = await requester.save();
        var save2 = await otherFriends.save();

        return res.status(200).json({
            message: "OKAY"
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            message: "ERROR"
        });
    }
}

async function modifyFriendStatus(res, requester, requestee, status, index){
    try{
        var otherProfile = await Profile.findById(requestee.profileID).exec();
        var otherFriends = await Friend.findById(otherProfile.friends).exec();

        //find the requester in the other friends object
        for (i = 0; i < otherFriends.profiles.length; i++) {
            if (otherFriends.profiles[i].profileID.toString() === requester.profileID.toString()){
                //modify status unless marked for removal then delete
                if(status !== 'removed' && status !== 'rejected'){
                    otherFriends.profiles[i].status = status;
                    requester.profiles[index].status = status;
                }else{
                    otherfriends.profiles.splice(i, 1);
                    requester.profiles.splice(index, 1);
                }
                //ensure update
                requester.markModified('profiles');
                otherFriends.markModified('profiles');
                
                var save1 = await requester.save();
                var save2 = await otherFriends.save();
                return res.status(200).json({
                    message: "OKAY"
                });
            }
        }
    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "ERROR"
        });
    }
}