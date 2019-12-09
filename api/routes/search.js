const express = require('express');
const router = express.Router();
const search = require('../controllers/searchPosts');

router.get('/', search);

module.exports = router;
