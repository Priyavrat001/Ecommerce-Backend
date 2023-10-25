const express = require('express');
const router = express.Router();
const User = require("../models/userModels");
const ErrorHandler = require('../errorHandler/errorHandler');
const sendToken = require('../utils/JWTToken');

// Router:1: For creating new user route
router.post('/createuser', async(req, res, next)=>{
    try {
        const user = await User.create({
            email:req.body.email,
            name:req.body.name,
            password:req.body.password,
            avatar:{
                public_id:"this is sample id",
                url:"imageUrl"
            }
        })
        sendToken(user, 200, res)
    } catch (error) {
        next(new ErrorHandler(error, 404))
    }
})
// Router:2: For loging in route
router.post('/login', async(req, res, next)=>{
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return next(new ErrorHandler("Please enter email and password.", 400))
        }
        const user = await User.findOne({email}).select("+password")
        if(!user){
            return next(new ErrorHandler("Invalid email or password", 401))
        }
        const passwordCompare = user.comparePassword(password);
        if(!passwordCompare ){
            return next(new ErrorHandler("Invalid email or password", 401));
        }
      sendToken(user, 200, res)
    } catch (error) {
        next(new ErrorHandler(error, 404))
    }
})

// Route:3: log out route
router.get('/logout', (req, res, next)=>{
    try {
        
        res.cookie("token", null,{
            expire:new Date(Date.now),
            httpOnly:true
        })
        res.status(200).json({success:true, message:"logged out user."})
    } catch (error) {
        next(new ErrorHandler(error, 500))
    }
})
module.exports = router;