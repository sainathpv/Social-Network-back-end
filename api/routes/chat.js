const express = require('express');
const router = express.Router();
const ChatsController = require('../controllers/chats');
const check2Auth = require('../middleware/check-2auth');

router.post('/sendMessage', check2Auth, ChatsController.chats_sendMessage);

router.post('/create', check2Auth, ChatsController.chats_createRoom);

router.get('/', check2Auth, ChatsController.chats_getRooms);

module.exports = router;