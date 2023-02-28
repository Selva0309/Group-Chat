const path = require('path');

const express = require('express');

const router = express.Router();

const UserAuth = require('../middleware/authentication');

const groupcontroller = require('../controllers/groupcontroller');

router.post('/create', UserAuth.authenticate, groupcontroller.creategroup);
router.get('/getgroups', UserAuth.authenticate, groupcontroller.getgroups);
router.get('/getgroupusers', UserAuth.authenticate, groupcontroller.getgroupusers)
router.put('/removeuser', UserAuth.authenticate, groupcontroller.removeuser)
router.post('/adduser', groupcontroller.addusertogroup)
router.put('/changeaccess', UserAuth.authenticate, groupcontroller.changeaccess)

module.exports = router;