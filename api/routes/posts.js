const express = require('express');
const router = express.Router();
const multer = require('multer');
const PostController = require('../controllers/posts');
const check2Auth = require('../middleware/check-2auth');

//The following code are for uploading images
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
var fileName = ""

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'staticAssets/images/posts');
  },
  filename: function (req, file, cb) {
    fileName = req.body.userID + file.originalname;
    cb(null, fileName);
  }
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.post('/postPosts', check2Auth, upload.single('postImg'), PostController.posts_post);

router.get('/getPosts', PostController.posts_get);

router.post("/postComment", PostController.posts_comment);

router.post("/postvote", check2Auth, PostController.posts_vote);

module.exports = router;
