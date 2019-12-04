const Event = require('../models/event');
const Profile = require('../models/profile');
const mongoose = require('mongoose');
exports.events_create = async (req, res, next) => {
    try{
        var content; 
        if(req.body.type === "image"){
            //Need help with this
        }else if(req.body.type === "video"){
            content = "https://www.youtube.com/embed/" + req.body.content.split("=")[1];
        }else{
            content = req.body.content;
        }
    
        var profile = await Profile.findOne({user: req.userData.userID}).exec();
        const event = new Event({
            _id: new mongoose.Types.ObjectId(),
            profileID: profile._id,
            content: content,
            time: req.body.time,
            company: profile.name,
            eventName: req.body.eventName,
            date: req.body.date
        });
        profile.events.push(event._id);
        var save1 = await event.save();
        var save2 = await profile.save();
        return res.status(200).json({
            message: "Event created"
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "ERROR"
        });
    }
}

//external get
exports.events_get = async (req, res, next) => {
    try {
        var events = await Event.find({}).exec();
        var result = [];
        var now = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        for(var i = 0; i < events.length; i++){
            if(events[i].data < now){
                result.push({
                    eventID: event._id,
                    company: events[i].company,
                    date: event.date,
                    time: event.time,
                    location: event.location,
                    type: event.type,
                    profileID: event.profileID,
                    content: event.content,
                    going: event.going.length,
                    eventName: event.eventName
                });
            }else{
                var deleting = await Event.findByIdAndRemove(events[i]._id);
            }
        }

        return res.status(200).json({
            events: result
        });
    } catch (error) {
        console.error("ERROR " + error.message);
        return res.status(500).json({
            message: 'Server error'
        });
    }
}

exports.events_edit = (req, res, next) => {
    Event.findById(req.body.eventID).exec().then( event => {
        var event = new Event({
            content: req.body.content,
            tags: [req.body.tag],
            eventName: req.body.eventName,
            date: req.body.date,
        });

        event.save().then(result => {
            res.status(200).json({
                message: "OKAY"
            });
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
}

exports.events_going = (req, res, next) =>{
   
    Event.findById(req.body.eventID).exec().then( event => {
        Profile.findOne({user: req.userData.userID}).exec().then(profile => {
            event.going.includes(profile.profileID);
            event.going.push(profile.profileID);
            event.save().then(result => {
                res.status(200).json({
                    message: "OKAY"
                });
            });
        });

    }).catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
}

exports.events_delete = (req, res, next) => {
    Event.findById(req.body.eventID).exec().then( event => {
    Profile.findOne(req.userData.userID).exec().then(profile => {
        if(event.profileID.toString() === profile._id.toString()){
            event.remove();
            return res.status(200).json({message: "OKAY"});
        }else{
            return res.status(409).json({message: "UNAUTHORIZED"});
        }
    });
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
}