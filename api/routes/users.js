const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const UserController = require('../controllers/users');

router.post('/signup',  UserController.users_signup );

router.post('/questions', checkAuth, UserController.users_postQuestions);

router.post('/login', UserController.users_login);

router.post('/deleteUser', checkAuth, UserController.users_delete);



module.exports = router;
