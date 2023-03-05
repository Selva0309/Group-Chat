const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const sequelize = require('./utils/database');

const helmet = require('helmet');
const morgan = require('morgan');
var cors = require('cors');
const http = require('http');
const socketio = require('socket.io');


//models
const User = require('./model/user');
const Message = require('./model/messages')
const Group = require('./model/groups');
const Usergroup = require('./model/usergroup');
const Uuid = require('./model/uuid-table');
const Usersockets = require('./model/usersockets')
//routes
const userroute= require('./routes/user-route');
const messageroute = require('./routes/messages')
const grouproute = require('./routes/grouproute');
const passwordroute = require('./routes/password');

const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {flags: 'a'})

const express = require('express');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

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
          io.to(`room-${groupid}`).emit('refreshgroup')
        } else {
          console.error(`User ${user} not found`);
        }
      
    });
  })
})



app.use(express.static(path.join(__dirname,'Frontend')));
app.use(express.static(path.join(__dirname,'Frontend','login')));
app.use(express.static(path.join(__dirname,'Frontend','Chats')));
app.use(express.static(path.join(__dirname,'Frontend', 'password')));


// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors(
  {
    origin: 'http://127.0.0.1:5500'
  }
));

app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
app.use(morgan('combined', {stream: accessLogStream}));

app.use('/user', userroute);
app.use('/message', messageroute)
app.use('/group', grouproute);
app.use('/password', passwordroute);

app.use((req,res)=>{
    res.sendFile(path.join(__dirname, "Frontend/login/Loginsignup.html"))
})


Group.belongsToMany(User, {through: Usergroup})
User.belongsToMany(Group, {through: Usergroup})


User.hasMany(Message);
Message.belongsTo(User);

Group.hasMany(Message);
Message.belongsTo(Group);

User.hasMany(Uuid);
Uuid.belongsTo(User);

User.hasOne(Usersockets);
Usersockets.belongsTo(User);



sequelize.sync()
.then(result=>{

server.listen(process.env.PORT || 4000);
})
.catch(err=>console.log(err));

