const express = require('express');
const router = express.Router();
const ChatsController = require('../controllers/chats');
const check2Auth = require('../middleware/check-2auth');

router.post('/chat_auth', check2Auth, ChatsController.chat_auth);

module.exports = router;