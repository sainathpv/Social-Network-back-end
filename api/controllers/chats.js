const Profile = require('../models/profile');
const Chat = require('../models/chat');
const mongoose = require('mongoose');
var io = require('socket.io');

exports.chats_createRoom = async (req, res, next) => {
    try{
        var room = new Chat({
            _id: new mongoose.Types.ObjectId(),
            chatName: req.body.chatName,
            users: req.body.users
        });
        for(var i = 0; i < req.body.users.length; i++){
            var otherProfile = await Profile.findOne({name: req.body.users[i]});
            otherProfile.chats.push(room._id);
            var save1 = await otherProfile.save();
        }
        var save2 = await room.save();

        res.status(200).json({
            message: "Created"
        })
    }catch(error){
        console.log(error);
        res.status(500).json({
            message: "ERROR"
        })
    }
}

exports.chats_sendMessage = async (req, res, next) => {
    try{
        var profile = await Profile.findOne({user: req.userData.userID});
        var chat = await Chat.findById(req.body.chatID);
        if(chat.users.includes(profile.name)){
            chat.messages.push({
                userName: profile.name,
                text: req.body.message
            });
            chat.markModified('messages');
            var save = await chat.save();
            return res.status(200).json({
                chat: chat
            });
        }else{
            return res.status(401);
        }

    }catch(error){
        console.log(error);
        res.status(500).json({
            message: "ERROR"
        })
    }
}

exports.chats_getRooms = async (req, res, next) => {
    try{
        var profile = await Profile.findOne({user: req.userData.userID});
        var result = [];
        for(var i = 0; i < profile.chats.length; i++){
            var chat = await Chat.findById(profile.chats[i]);
            if(chat != null)
                result.push(chat);
        }
        res.status(200).json({
            chats:  result
        });
    }catch(error){
        console.log(error);
        res.status(500).json({
            message: "ERROR"
        })
    }
}