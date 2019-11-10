const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const UserController = require('../controllers/users');
// for login, after varified user's secret, we ask user for the 6 letter token on their phone
router.post('/twoFALogin', checkAuth, UserController.users_2fa);

module.exports = router;
