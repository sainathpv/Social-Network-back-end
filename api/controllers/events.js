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
            type: req.body.type,
            location: req.body.location,
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
        for(var i = 0; i < events.length; i++){
            result.push({
                eventID: events[i]._id,
                company: events[i].company,
                date: events[i].date.getMonth() + "/" + events[i].date.getDate() + "/" + events[i].date.getFullYear(),
                time: events[i].time,
                location: events[i].location,
                type: events[i].type,
                profileID: events[i].profileID,
                content: events[i].content,
                going: events[i].going.length,
                eventName: events[i].eventName
            });
        }

        return res.status(200).json({
            events: result
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Server error'
        });
    }
}

exports.events_getUser = async (req, res, next) => {
    try{
        var profile = await Profile.findOne({user: req.userData.userID});
        var events = await Event.find({}).exec();
    
        var result = [];
        for(var i = 0; i < events.length; i++){
            if(events[i].going.includes(profile._id.toString)){
                var time = events[i].time.split(":");
                result.push({
                    eventID: events[i]._id,
                    company: events[i].company,
                    date: events[i].date.getMonth() + "/" + events[i].date.getDate() + "/" + events[i].date.getFullYear(),
                    time: time[0] % 13 === 0 ? 1 + ":" + time[1] : time[0] % 13 + ":" + time[1],
                    location: events[i].location,
                    type: events[i].type,
                    profileID: events[i].profileID,
                    content: events[i].content,
                    going: events[i].going.length,
                    eventName: events[i].eventName
                });
            }
        }
        res.status(200).json({
            events: result
        });
    }catch(error){
        console.log(error);
        res.status(500).json({
            message: "ERROR"
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
    console.log(req.body.eventID);
    Event.findById(req.body.eventID).exec().then( event => {
        Profile.findOne({user: req.userData.userID}).exec().then(profile => {
            if(!event.going.includes(profile.profileID)){
                event.going.push(profile.profileID);
                event.markModified('going');
                return event.save().then(result => {
                    res.status(200).json({
                        event: event
                    });
                });
            }else{
                event.going.splice(event.going.indexOf(profile.profileID), 1);
                event.markModified('going');
                return event.save().then(result => {
                    res.status(200).json({
                        event: event
                    });
                });
            }
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
            return res.status(401).json({message: "UNAUTHORIZED"});
        }
    });
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
}