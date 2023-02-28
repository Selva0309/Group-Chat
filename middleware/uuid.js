const {v4 : uuidv4} = require('uuid');
const Uuid = require('../model/uuid-table');
const User = require('../model/user');
const e = require('express');

exports.idgenerate = async (req,res,next)=>{
    try{
        const uuid = uuidv4();
        const emailID = req.body.emailID;
        // console.log(uuid);
        var activeid;
        await User.findAll(
            {where: {email : emailID}})
            .then(user=>{
                req.user = user[0];
                console.log(req.user, user[0])
                return req.user.getUuids({where: {isactive : true}})
                .then(uuids=>{
                    if(uuids.length > 0){
                       activeid = uuids[0].id;
                    } else{
                        return req.user.createUuid({id: uuid})
                        .then(()=>{
                         activeid = uuid;
                        })
            }})
             
                }).then(()=>{
                req.body.uuid = activeid;
                console.log(activeid);
                next();
            })
            
            
            
        } catch(err){
            throw new Error(err)
        }
    }