const path = require('path');

const express = require('express');

const router = express.Router();

const UserAuth = require('../middleware/authentication');

const groupcontroller = require('../controllers/groupcontroller');

router.post('/create', UserAuth.authenticate, groupcontroller.creategroup);
router.get('/getgroups', UserAuth.authenticate, groupcontroller.getgroups);
router.get('/getgroupusers', groupcontroller.getgroupusers)
router.post('/adduser', groupcontroller.addusertogroup)

module.exports = router;