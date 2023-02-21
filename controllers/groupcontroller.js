const { Sequelize, Op } = require("sequelize");
const Group = require('../model/groups');
const User = require('../model/user');
const Message = require('../model/messages');

const sequelize = require('../utils/database');

exports.creategroup = async(req,res,next)=>{
    try{
        const groupname = req.body.name;
        console.log(groupname);
        const creategroup = await req.user.createGroup({
            groupname: groupname
        });
        creategroup.addUser(req.user);

        res.status(200).json({message: "Group created successfully", id: creategroup.id})
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
        const groupid = +req.query.groupid;
        const group = await Group.findOne({
            where: {id : groupid}
        })
        // console.log(group);
        const groupusers = await group.getUsers({
            attributes: ['id', 'name'] 
        });
        // console.log(typeof groupusers);
        const allusers = await User.findAll({
            attributes: ['id', 'name'] 
        })
        res.status(200).json({groupusers: groupusers, allusers: allusers })
    } catch(error){
        console.log(error);
    }
}

exports.addusertogroup = async (req,res,next)=>{
    try{
        const userid = req.body.userId;
        const groupid = req.body.groupid;
        const user = await User.findOne({
            where: {id: userid}
        });
        const group = await Group.findOne(
            {
                where: {id: groupid}
            }
        );
        group.addUser(user);
        res.status(200).json({success: true, notification:`added ${user.name} to the group`, message: 'User added successfully'})    
    }catch(error){
        console.log(error)
    }
}

