const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

exports.signup=async(req,res,next)=>{
    try{
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;
    const password = req.body.password;
    console.log(email,name, phone,password);
    const currentuser = await User.findOne({where: {email: email}})
    if (currentuser){
            console.log('User Exists');
            return res.status(400).json({success: false, message:"User already exists. Please login with the email credentials"})  
    } else{
            console.log('User not exists');
            const saltrounds = 10;
            bcrypt.hash(password,saltrounds, async (err, hash)=>{
                console.log('hashing done')
                await User.create({
                    name: name,
                    phone: phone,
                    email: email,
                    password: hash
                })
                console.log('User created')    
                return res.status(201).json({success: true, message:"Signed up successfully"})    
            })
            
            
}
}catch(err) {
    console.log(err)
}}


exports.loginuser= async (req,res,next)=>{
    // console.log(req.body,req.params, req.data);
    try{
    const email = req.body.email;
    const password = req.body.password;
    const existinguser = await User.findOne({where: {email: email}})
    if (existinguser){
            bcrypt.compare(password, existinguser.password, (err,result)=>{
                console.log(result);
                if (err){
                    throw new Error('Something went wrong');
                }
                if(result === true){
                    return res.status(201).json({success: true, message:"Logged in successfully", token: accesstoken(existinguser.id,existinguser.name), id : existinguser.id})
                    // res.redirect('/Expenses.html');
                }
                else {
                    return res.status(401).json({success: false, message:"Incorrect password!!"})
                }
            })
                
        }else{
           return res.status(404).json({success: false, message:"User does not exists. Please signup with details"})
        }

} catch (err) {
    console.log(err);
}     
};

function accesstoken(id,name){
    let token = jwt.sign({userId: id, name:name},process.env.SIGN_KEY)
    console.log(token);
    return token;
}   