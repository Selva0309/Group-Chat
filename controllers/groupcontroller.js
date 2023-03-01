const { Sequelize, Op } = require("sequelize");
const Group = require('../model/groups');
const User = require('../model/user');
const Message = require('../model/messages');
const Usergroup = require('../model/usergroup');

const sequelize = require('../utils/database');
const e = require("express");

exports.creategroup = async(req,res,next)=>{
    try{
        const notification = [];
        const groupname = req.body.name;
        const selectedusers = req.body.users;
        console.log(groupname);
        const creategroup = await req.user.createGroup({
            groupname: groupname
        });
        const createduser = await creategroup.addUser(req.user, {
            through: { isGroupAdmin: true }
          });
        if(createduser) notification.push('created the group'); 
                    
        if(selectedusers){
            selectedusers.forEach(async element => {
                const id = +element;
                const user = await User.findByPk(id);
                // console.log(user);
                creategroup.addUser(user, {
                    through: { isGroupAdmin: false }
                  });
                notification.push(`added ${user.name} to the group`)  
            });
        }
        sendnotification(notification, creategroup.id, req.user.id);
        res.status(200).json({message: "Group created successfully", id: creategroup.id, name: groupname})
    }catch(err) {
        console.log(err);
    }
}

exports.getgroups = async(req,res,next)=>{
    try{
        const groups = await req.user.getGroups();
        res.status(200).json({success: true, group: groups})
    }catch(err) {
        console.log(err);
    }
}

exports.getgroupusers = async(req,res,next)=>{
    try{
        let currentuserAdmin;
        const groupid = +req.query.groupid;
        const group = await Group.findOne({
            where: {id : groupid}
        })
        // console.log(group);
        const groupusers = await group.getUsers({
            attributes: ['id', 'name'] 
        });
        // console.log(typeof groupusers);
        const currentuser = await group.getUsers({where: {id: req.user.id},
            attributes: ['id', 'name'] 
        })
        currentuserAdmin = currentuser[0].usergroup.isGroupAdmin;

        // console.log(currentuser);
        
        res.status(200).json({groupusers: groupusers, admin: currentuserAdmin})
    } catch(error){
        console.log(error);
    }
}

exports.addusertogroup = async (req,res,next)=>{
    try{
        const usersid = req.body.users;
        const groupid = req.body.groupid;
        let notification=[];
        usersid.forEach(async id=>{
            const user = await User.findOne({
                where: {id: id},
                attributes: ['id', 'name']
            });
            const group = await Group.findOne(
                {
                    where: {id: groupid}
                }
            );
            group.addUser(user);
            notification.push(`added ${user.name} to the group`);
            sendnotification(notification, groupid, req.user.id)

        })
        
        res.status(200).json({success: true, message: 'User added successfully'})    
    }catch(error){
        console.log(error)
    }
}

async function sendnotification(messages,groupid, userid){
    try{
        const user = await User.findByPk(userid);
        messages.forEach(async message=>{
            const updatemessage = await user.createMessage({
                messagetext: message,
                type: 'notification',
                groupId: groupid            
        })    
        }) 
    } catch(err){
        console.log(err)
    }
}

exports.removeuser= async(req,res,next)=>{
    try {
        const groupID = req.body.groupid;
        const userID = req.body.userid;
        const groupuser = await User.findOne({where: {id: userID}, attributes: ['id', 'name']})
        const usergroup = await Usergroup.findOne({where: {
            groupId: groupID,
            userId: userID
        }})
        console.log(usergroup)
        const result = await usergroup.destroy();
        let notification=[];
        notification.push(`removed ${groupuser.name} from the group`)
        sendnotification(notification, groupID, req.user.id);

        res.status(200).json({message: 'User removed successfully', user:groupuser})

    } catch (error) {
        console.log(error);
    }
}

exports.changeaccess= async(req,res,next)=>{
    try {
        const groupID = req.body.groupid;
        const userID = req.body.userid;
        const groupuser = await User.findOne({where: {id: userID}, attributes: ['id', 'name']})
        const usergroup = await Usergroup.findOne({where: {
            groupId: groupID,
            userId: userID
        }})
        usergroup.isGroupAdmin = !usergroup.isGroupAdmin;
        console.log(usergroup.isGroupAdmin)
        const result = await usergroup.save();
        const notification = []
        let message = (usergroup.isGroupAdmin) ? 'gave' : 'removed';
        notification.push(`${message} ${groupuser.name} Admin access in the group`)
        sendnotification(notification, groupID, req.user.id);

        res.status(200).json({message: 'Access changed successfully', access:result})
    } catch (error) {
        console.log(error);
    }
}