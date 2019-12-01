const express = require("express");
const router = express.Router();
const ForgotPswController = require('../controllers/forgot_psw');
const check2Auth = require('../middleware/check-2auth');

router.get("/forgot_psw_questions/:email", ForgotPswController.forgot_pwd_getQuestions);

router.post("/forgot_psw_questions",  ForgotPswController.forgot_psw_questions);

router.post("/forgot_psw_email",  ForgotPswController.forgot_psw_email);

router.post("/reset", ForgotPswController.forgot_psw_reset);

module.exports = router;