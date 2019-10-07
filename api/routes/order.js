const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const Order = require("../models/order")
const Post = require("../models/userPost")

router.get("/", (req, res, next) => {
    Order
    .find()
    .select("userPost quantity")
    .populate("userPost")
    .exec()
    .then( docs => {
        res.status(200).json(docs);
    })
    .catch(err => {
        res.status(500).json({
            messsage: "aha",
            error: err})
    });
});

router.post("/", (req, res, next) => {
    Post.findById(req.body.userPostID)
    .then(userPost => {
        if (!userPost) {
            return res.status(404).json({
                message: "Post not found"
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