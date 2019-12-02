const express = require("express");
const router = express.Router();
const ResetCriticalController = require('../controllers/resetCritical');
const check2Auth = require('../middleware/check-2auth');

router.post("/confirmPsw", check2Auth, ResetCriticalController.confirm_psw);

router.post("/resetPsw", check2Auth, ResetCriticalController.reset_psw);

router.post("/sendEmailValCode", check2Auth, ResetCriticalController.send_email_val_vode);

router.post("/resetEmail", check2Auth, ResetCriticalController.reset_email);

module.exports = router;