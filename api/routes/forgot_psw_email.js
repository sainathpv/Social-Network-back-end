const express = require("express");
const router = express.Router();
const ForgotPswController = require('../controllers/forgot_psw');

router.post("/forgot_psw_email",  ForgotPswController.forgot_psw_email);

module.exports = router;