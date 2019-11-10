const express = require("express");
const router = express.Router();
const ForgotPswController = require('../controllers/forgot_psw');


router.post("/reset", ForgotPswController.forgot_psw_reset);

module.exports = router;