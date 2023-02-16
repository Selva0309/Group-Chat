const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const sequelize = require('./utils/database');
const helmet = require('helmet');
const morgan = require('morgan');
var cors = require('cors');

//models
const User = require('./model/user');

//routes
const userroute= require('./routes/user-route');

const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {flags: 'a'})

const express = require('express');

const app = express();


app.use(express.static(path.join(__dirname,'Frontend')));

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
app.use(morgan('combined', {stream: accessLogStream}));

app.use('/user', userroute);

app.use((req,res)=>{
    res.sendFile(path.join(__dirname, "Frontend/home.html"))
})

sequelize.sync()
.then(result=>{

app.listen(process.env.PORT || 4000);
})
.catch(err=>console.log(err));

