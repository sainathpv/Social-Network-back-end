const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/post');
const Friends = require('../models/friends');
const Comment = require('../models/comment');
const mongoose = require('mongoose');
const check2Auth = require('../middleware/check-2auth');
const fs = require('fs');

const FriendsController = require('../controllers/friends');

router.post('/createfriends', check2Auth, FriendsController.friends_create);

router.post('/editfriends', check2Auth, FriendsController.friends_edit);

router.get('/', check2Auth, FriendsController.friends_get);