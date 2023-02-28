const path = require('path');
const express = require('express');


const router = express.Router();

const uuid = require('../middleware/uuid');
const passwordcontroller = require('../controllers/passwordcontroller');

router.use('/updatepassword', passwordcontroller.updatepassword)

router.use('/resetpassword/:id',passwordcontroller.resetpassword)
router.post('/forgotpassword', uuid.idgenerate, passwordcontroller.forgotpassword);


module.exports = router;
