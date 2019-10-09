const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const multer = require("multer");
const Profile = require('../models/profile');
const User = require("../models/user");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './profileImg/')
    }, 
    filename: function(req, file, cb){
        var today = new Date();
        var date = today.getFullYear()+'_'+(today.getMonth()+1)+'_'+today.getDate();
        var time = today.getHours() + "-" + today.getMinutes();
        var dateTime = date+ "(" +time + ")";

        cb(null, 
            dateTime + file.originalname);
    }
})

const fileFilter = function(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const imgUpload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


router.get("/", (req, res, next) => {
    Order
    .find()
    .select("User basicInfo")
    .populate("user")
    .exec()
    .then( docs => {
        res.status(200).json(docs);
    })
    .catch(err => {
        res.status(500).json({
            messsage: "Failed to get all users",
            error: err})
    });
});

router.post("/", (req, res, next) => {
    Post.findById(req.body.userID)
    .then(userProfile => {
        if (!userProfile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            userPost: req.body.userPostID,
            quantity: req.body.quantity
        });
        return order.save()
        }).then(result => {
            console.log(result);
            res.status(201).json(result)
    })
    .catch(err =>{
        res.status(500).json({
            message: 'Post not found',
            error: err
        });
    });
});

router.get("/:orderID", (req, res, next) => {
    Order.findById(req.params.orderID)
    .populate("userPost")
    .exec()
    .then(order => {
        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }
        console.log(order);
        res.status(200).json({ order });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
});

router.patch("/:orderID", (req, res, next) => {
    res.status(200).json({
        message: "Order Update!"
    });
});

router.delete("/:orderID", (req, res, next) => {
    Order.remove({ _id: req.params.orderID})
    .exec()
    .then(order => {
        res.status(200).json({ 
            message: "Order deleted",
            order: order });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
});

module.exports = router;