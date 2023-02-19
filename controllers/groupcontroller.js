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