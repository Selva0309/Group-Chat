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
const socketFunctions = require('./middleware/socketfunctions')(io);



//Static paths
app.use(express.static(path.join(__dirname,'FrontEnd')));
app.use(express.static(path.join(__dirname,'FrontEnd','login')));
app.use(express.static(path.join(__dirname,'FrontEnd','Chats')));
app.use(express.static(path.join(__dirname,'FrontEnd', 'password')));


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
    res.sendFile(path.join(__dirname, "FrontEnd/login/Loginsignup.html"))
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

