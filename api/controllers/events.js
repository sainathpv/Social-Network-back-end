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

function getEvent(tags, listOfEvents, i, length, callback) {
    Event.find({ tags: tags[i] })
    .populate("event")
    .exec()
    .then(result => {
      
    listOfEvents = listOfEvents.concat(result)
        if (i == length - 1 || -1 == length -1) {
            console.log(i)
            callback(listOfEvents)
        } else {
            getPost(tags, listOfEvents, i + 1, length, callback);
        }
    })
    .catch(err => {
        console.log(err);
        return "Something is wrong when getting all the post";
    });
}

exports.events_get = (req, res, next) => {
    var listOfTags = JSON.parse(req.query.tags);
    var listOfEvents = [];
    try {
        var i = 0;
        getEvent(listOfTags, listOfEvents, i, listOfTags.length, function (result) {
            listOfEvents = listOfEvents;
            res.status(200).json({
                return: listOfEvents
            });
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            message: 'Server error'
        });
    }
}

exports.events_edit = (req, res, next) => {
    Event.findById(req.body.eventID).exec().then( event => {
        const event = new Event({
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