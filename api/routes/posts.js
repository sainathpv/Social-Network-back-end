const express = require('express');
const router = express.Router();
const PostController = require('../controllers/posts');
const check2Auth = require('../middleware/check-2auth');

router.post('/postPosts', check2Auth, PostController.posts_post);

router.get('/getPosts', PostController.posts_get);

router.post("/postComment", PostController.posts_comment);

router.get("/postGetPoll/:pollID", PostController.posts_getPoll);

router.get("/postGetPollVote/:pollID", check2Auth, PostController.posts_getVotePoll);

router.post("/postVotePoll", check2Auth, PostController.posts_votePoll);

router.post("/postvote", check2Auth, PostController.posts_vote);

router.get("/getvote/:postID", check2Auth, PostController.posts_getVote)

router.get('/postByID/:id', PostController.posts_getByID);

module.exports = router;
