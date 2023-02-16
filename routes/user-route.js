const path = require('path');
const express = require('express');

const router = express.Router();

//models
const User = require('../model/user');

//controllers
const usercontroller = require('../controllers/usercontroller');

router.post('/signup', usercontroller.signup);
router.post('/login',usercontroller.loginuser);

module.exports = router;
