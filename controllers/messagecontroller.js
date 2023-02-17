const path = require('path');
const Message = require('../model/messages');
const User = require('../model/user')
const sequelize = require('../utils/database');

exports.sendmessage = async (req, res, next)=>{
    try{
        const messagecontent = req.body.message;
        const updatemessage = await req.user.createMessage({
                messagetext: messagecontent            
        })
        res.status(200).json({success:true, message:"Message Sent"}) 
    } catch(err){
        console.log(err)
    }
}