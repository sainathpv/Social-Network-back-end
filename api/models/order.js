const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userPost: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required:true
    },

    quantity: {
        type: Number, 
        default: 1
    }
});

module.exports = mongoose.model('Order', orderSchema)