const express = require('express');
const router = express.Router();
const check2Auth = require('../middleware/check-2auth');


const FriendsController = require('../controllers/friends');

router.post('/editfriends', check2Auth, FriendsController.friends_edit);

router.post('/addfriend', check2Auth, FriendsController.friends_requestFriendWithUserName);

router.get('/', check2Auth, FriendsController.friends_get);

module.exports = router;