const path = require('path');
const Message = require('../model/messages');
const User = require('../model/user')
const sequelize = require('../utils/database');
const { Sequelize, Op } = require("sequelize");
const AWS = require('aws-sdk');
const fs = require('fs');
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage()
  });

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

exports.fileupload = async(req,res,next)=>{
    try {
        const file = req.file;
        const groupid = req.body.groupid;
        const userID = req.user.id;
        const type = req.body.type;
        const name = req.body.name;
        
        console.log(groupid, userID, type, name);
        
 
        var params = {
            Bucket: process.env.BUCKET_NAME,
            Key: file.originalname,
            Body: file.buffer,
            ACL: 'public-read'
        } 

        const fileURL = await uploadToS3(params);
        const updatemessage = await req.user.createMessage({
            messagetext: `${file.originalname}*${fileURL}`,
            type: type,
            groupId: groupid            
    })
        res.status(200).json({fileURL, updatemessage, success: true});
    } catch (error) {
        console.log(error)
    }

}

function uploadToS3(params){
    
    let s3bucket = new AWS.S3({
        accessKeyId: process.env.IAM_USER_KEY,
        secretAccessKey: process.env.IAM_USER_SECRET
    })
      
    return new Promise((resolve, reject)=>{
        s3bucket.upload(params, (err, s3response)=>{
            if(err){
                console.log('Something went wrong', err)
                reject(err)
            }else {
                console.log('success', s3response);
                
                resolve(s3response.Location);
            }
        })
    })
}

