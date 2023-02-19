const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const sequelize = require('./utils/database');
const helmet = require('helmet');
const morgan = require('morgan');
var cors = require('cors');

//models
const User = require('./model/user');
const Message = require('./model/messages')
const Group = require('./model/groups');
const Usergroup = require('./model/usergroup');
//routes
const userroute= require('./routes/user-route');
const messageroute = require('./routes/messages')
const grouproute = require('./routes/grouproute');

const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {flags: 'a'})

const express = require('express');

const app = express();


app.use(express.static(path.join(__dirname,'Frontend')));

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

app.use((req,res)=>{
    res.sendFile(path.join(__dirname, "Frontend/home.html"))
})

User.hasMany(Group);
Group.belongsToMany(User, {through: Usergroup})

User.hasMany(Message);
Message.belongsTo(User);

Group.hasMany(Message);
Message.belongsTo(Group);

sequelize.sync()
.then(result=>{

app.listen(process.env.PORT || 4000);
})
.catch(err=>console.log(err));

