const path = require('path');
const Message = require('../model/messages');
const User = require('../model/user')
const sequelize = require('../utils/database');
const { Sequelize, Op } = require("sequelize");

exports.sendmessage = async (req, res, next)=>{
    try{
        const messagecontent = req.body.message;
        const type = req.body.type;
        const groupid = req.body.groupid;
        
        const updatemessage = await req.user.createMessage({
                messagetext: messagecontent,
                type: type,
                groupId: groupid            
        })
        res.status(200).json({success:true, message:"Message Sent"}) 
    } catch(err){
        console.log(err)
    }
}

exports.getmessages = async (req,res,next) =>{
    try{
        const lastmsgid = +req.query.messageid;
        const groupid = +req.query.groupid;
        console.log(lastmsgid, groupid);

        const newmessages = await Message.findAll({
            where:{
                groupId: groupid,
                id: {
                    [Op.gt]: lastmsgid
                }
            },
            attributes: ['id', 'messagetext','type', 'createdAt', 'groupId'],
            subQuery: false,
            include: [
                {
                    model: User,
                    attributes:['id','name']
                }
            ],
            
        });
        res.status(200).json({success: true, messages: newmessages})

    }catch(err) {
        console.log(err);
    }
}