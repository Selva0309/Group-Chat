//models
const User = require('../model/user');
const Message = require('../model/messages')
const Group = require('../model/groups');
const Usergroup = require('../model/usergroup');
const Uuid = require('../model/uuid-table');
const Usersockets = require('../model/usersockets')

module.exports = function(io) {
io.on("connection", async (socket) =>{
    console.log('userconnected');
    // console.log(socket.handshake.query);
    const userid= socket.handshake.query.user;
    const getuser = await User.findOne({where: {id: userid}})
    const getsocket = await getuser.getUsersocket();
    if (getsocket){
        getsocket.update({socketID : socket.id})
    } else {
      const createsocket = await getuser.createUsersocket({socketID: socket.id});
      console.log(createsocket.socketID);
    }
    // checking previously added group and joining the chat room
        const joinedgroups = await Usergroup.findAll({where: {userId: userid}})
        joinedgroups.forEach(group=>{
        socket.join(`room-${group.groupId}`);
        console.log(`User joined the room-${group.groupId}`);  
        })
    //After User creates the group
    socket.on('createroom', (groupusers, groupid)=>{
      console.log(groupusers);
      groupusers.forEach(async user => {
        const usersocketid = await Usersockets.findOne({where: {userid: +user}});
        // console.log(usersocketid.socketID);
        const usersocket = io.sockets.sockets.get(`${usersocketid.socketID}`);
        // console.log(usersocket)
        // Join the user to the room
          if (usersocket) {
            usersocket.join(`room-${groupid}`);
            
            console.log(`User ${user} has joined the room`);
            io.to(`room-${groupid}`).emit('refreshgroup');
            io.to(`room-${groupid}`).emit('refreshmsg', groupid);
          } else {
            console.error(`User ${user} not found`);

          }
        
      });
    })
  
    //Sending message to the group users
    socket.on('messagesent', (groupid)=>{
      io.to(`room-${groupid}`).emit('refreshmsg', groupid);
    })
  
    //User added to group
    socket.on('addusers', (users, groupid)=>{
    console.log(users);  
    users.forEach(async user => {
      const usersocketid = await Usersockets.findOne({where: {userid: +user}});
      // console.log(usersocketid.socketID);
      const usersocket = io.sockets.sockets.get(`${usersocketid.socketID}`);
      // console.log(usersocket)
      // Join the user to the room
        if (usersocket) {
          usersocket.join(`room-${groupid}`);
          
          console.log(`User ${user} has joined the room`);
          io.to(usersocketid.socketID).emit('refreshgroup');
        } else {
          console.error(`User ${user} not found`);
        }
      })
      io.to(`room-${groupid}`).emit('refreshmsg', groupid)
  })
  
  //Removing user from the group
  socket.on('removeuser', async (user, groupid)=>{
    
      const usersocketid = await Usersockets.findOne({where: {userid: +user}});
      // console.log(usersocketid.socketID);
      const usersocket = io.sockets.sockets.get(`${usersocketid.socketID}`);
      // console.log(usersocket)
      // Join the user to the room
        if (usersocket) {
          usersocket.leave(`room-${groupid}`);
          
          console.log(`User ${user} has left the room`);
          io.to(usersocketid.socketID).emit('refreshgroup');
        } else {
          console.error(`User ${user} not found`);
        }
      
      io.to(`room-${groupid}`).emit('refreshmsg', groupid)
  })
  
    //Notifying admin changes to the group
    socket.on('adminchange', (groupid)=>{
      io.to(`room-${groupid}`).emit('refreshmsg', groupid)
    })
  
  })
}