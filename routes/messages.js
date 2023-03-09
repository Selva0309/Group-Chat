const path = require('path');

const express = require('express');

const router = express.Router();

const Message = require('../model/messages');
const UserAuth = require('../middleware/authentication');


const app = express();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



const messagecontroller = require('../controllers/messagecontroller');

router.post('/send', UserAuth.authenticate, messagecontroller.sendmessage)
router.post('/fileupload', UserAuth.authenticate, upload.single('file'), messagecontroller.fileupload)
router.get('/getmessage', messagecontroller.getmessages)

module.exports = router;