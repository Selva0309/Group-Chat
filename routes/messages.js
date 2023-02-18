const path = require('path');

const express = require('express');

const router = express.Router();

const Message = require('../model/messages');
const UserAuth = require('../middleware/authentication');

const messagecontroller = require('../controllers/messagecontroller');

router.post('/send', UserAuth.authenticate, messagecontroller.sendmessage)
router.get('/getmessage/:lastmsgid', messagecontroller.getmessages)

module.exports = router;