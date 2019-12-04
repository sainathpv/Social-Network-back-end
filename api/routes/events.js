const express = require('express');
const router = express.Router();
const EventsController = require('../controllers/events');
const check2Auth = require('../middleware/check-2auth');
/*
JWT REQUIRED

body{
    eventName: STRING
    type: STRING
    content: STRING
    date: DATE
    tag: STRING
    location: STRING
}
*/
router.post('/create', check2Auth, EventsController.events_create);

router.get('/getUserEvents', check2Auth, EventsController.events_getUser);

router.get('/', EventsController.events_get);

router.post('/edit', check2Auth, EventsController.events_edit);

router.post('/going', check2Auth, EventsController.events_going);

router.delete('/', check2Auth, EventsController.events_delete);

module.exports = router;