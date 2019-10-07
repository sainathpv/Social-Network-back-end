const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const multer = require("multer");
const Post = require('../models/userPost');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './postUploads/')
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

const postUpload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


router.get("/", (req, res, next) => {
    Post.find()
    .select("firstname lastname password userPostImage email")
    .exec()
    .then( docs => {
        const returnMsg = {
            count: docs.length,
            userPost: docs
        }
        res.status(200).json(returnMsg );
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
});

router.post("/", postUpload.single('userPostImage'), (req, res, next) => {
    console.log(req.file);
    const userPost = new Post({
        _id: new mongoose.Types.ObjectId(),
        question: req.body.question,
        questionType: req.body.questionType, 
        userPostImage: req.file.path,
    });

    userPost.save().then(result => {
        console.log(result)
    }).catch(err => console.log(err));

    res.status(200).json({
        message: "Handling Post requests to /hoosierc",
        userPost: userPost
    });
});

router.get("/:userPostID", (req, res, next) => {
    const id = req.params.userPostID;
    Post.findById(id).exec().then(doc => {
        console.log(doc);
        res.status(200).json({ doc });
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
});
    

router.patch("/:userPostID", (req, res, next) => {
    const id = req.params.userPostID;
    const updateOps = {}
    for (const ops of req.body){
        updateOps[ops.atribName] = ops.value;
    }
    Post.update({_id: id}, {
        $set: updateOps}).exec().then(
            result => {
                console.log(result);
                res.status(200).json(result);
            }
        ).catch(err => {
            console.log(err);
            res.status(500).json({error: err})
        })
    });

router.delete("/:userPostID", (req, res, next) => {
    const id = req.params.userPostID;
    Post.remove({_id: id}).exec().then(result => {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.status(500).json({error: err})
    });
});

module.exports = router;