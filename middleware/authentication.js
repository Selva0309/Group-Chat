const jwt = require('jsonwebtoken');
const User = require('../model/user');
const dotenv = require('dotenv');
dotenv.config();

exports.authenticate = (req,res,next)=>{
    try{
        const token = req.header('Authorization');
        console.log(token);
        const user = jwt.verify(token, process.env.SIGN_KEY);
        let userId= user.userId;
        console.log(userId);
        User.findByPk(userId)
        .then(user=>{
            req.user = user;
            next();
        }).catch(err => {
            throw new Error(err)
        })
    } catch(err){
        return res.status(401).json({success: false})
    }


};