const express = require('express');
const router = express.Router();
const check2Auth = require('../middleware/check-2auth');
const SearchController = require('../controllers/searchPosts');

router.post("/searchposts", check2Auth, SearchController.searchPosts);

module.exports = router;
