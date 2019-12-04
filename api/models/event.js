const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    profileID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        require: true,
    },
    time: {type: String, require: true},
    type: {type: String, require: true},
    content: {type: String, require: true},
    eventName: {type: String, require: true},
    date: {type: Date, require: true},
    location: {type: String, require: true},
    company: {type: String, require: true},
    going: {type: Array , default: []}
});

module.exports = mongoose.model('Event', eventSchema);