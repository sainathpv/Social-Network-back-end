const Event = require('../models/event');
const Profile = require('../models/profile');

exports.events_create = (req, res, next) => {
    var content; 
    if(req.body.type === "image"){
        //Need help with this
    }else if(req.body.type === "video"){
        content = "https://www.youtube.com/embed/" + req.body.content.split("=")[1];
    }else{
        content = req.body.content;
    }

    Profile.findOne({user: req.userData.userID}).exec().then(profile => {
        const event = new Event({
            _id: new mongoose.Types.ObjectId(),
            profileID: req.body.profileID,
            comments: [],
            numLikes: 0,
            numDislikes: 0,
            content: content,
            tags: [req.body.tag],
            company: profile.name,
            eventName: req.body.eventName,
            date: req.body.date,
        });
        profile.events.push(event._id);
        event.save().then(result => {
            profile.save().then(result => {
                res.status(200).json({
                    message: "OKAY"
                });
            }).catch(err => res.status(500).json({error: err}));
        }).catch(err => res.status(500).json({error: err}));
    }).catch(err => res.status(500).json({error: err}));

    event.save().then(result => {
        return res.status(200).json({
            message: "Event created"
        });
    });
}

//external get
exports.events_get = async (req, res, next) => {
    try {
        var events = [];
        var eventIDs = JSON.parse(req.query.eventIDs);

        for(var i = 0; i < eventIDs.length; i++){
            var event = Event.findById(eventIDs[i]).exec();
            if(event != null){
                var now = new Date();
                //the date hasn't past
                if(event.date < now){
                    var eventOBJ = {
                        date: event.date,
                        company: event.company,
                        eventName: event.eventName,
                        location: event.location
                    }
                    events.push(eventOBJ);
                }else{
                    var id = eventIDs[i];
                    var event = await Event.findByIdAndRemove(id).exec();
                    var user = await Profile.findOne({user: req.userData.userID}).exec();

                    for(var j = 0; j < user.events.length; j++){
                        if(event._id.toString() === user.events[j].toString()){
                            user = user.events.splice(j, 1);
                            user.markModified('events');
                            user.save();
                            break;
                        }
                    }

                }
            }else{
                return res.status(410).json({
                    message: "GONE"
                });
            }
        }

        return res.status(200).json({
            events: events
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