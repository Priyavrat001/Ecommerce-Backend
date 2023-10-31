const express = require('express');
const router = express.Router();
const User = require("../models/userModels");
const ErrorHandler = require('../errorHandler/errorHandler');
const sendToken = require('../utils/JWTToken');
const { TokenExpiredError } = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { isAuthenticatedUser, authrizeRoles } = require('../middleware/auth');

// Router:1: For creating new user route
router.post('/createuser', async (req, res, next) => {
    try {
        const user = await User.create({
            email: req.body.email,
            name: req.body.name,
            password: req.body.password,
            avatar: {
                public_id: "this is sample id",
                url: "imageUrl"
            }
        })
        sendToken(user, 200, res)
    } catch (error) {
        next(new ErrorHandler(error, 404))
    }
})
// Router:2: login route
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password.", 400))
        }
        const user = await User.findOne({ email }).select("+password")
        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 401))
        }
        const passwordCompare = user.comparePassword(password);
        if (!passwordCompare) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }
        sendToken(user, 200, res)
    } catch (error) {
        next(new ErrorHandler(error, 404))
    }
})

// // Route:4: Forgot password route
// router.post('/password/forgotPassword', async (req, res, next) => {
//     try {
//         const user = await User.findOne({ email: req.body.email });
//         if (!user) {
//             return next(new ErrorHandler("User not found.", 404))
//         }
//         // Get reset password TokenExpiredError
//         const resetToken = user.getResetPassword();
//         await user.save({ validateBeforeSave: false });
//         const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/user/password/reset/${resetToken}`;
    
//         const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n if you have not requested this email then please ignore it`;
        
    
//         await sendEmail({
//             email: user.email,
//             subject: "Eccomerce password recovery.",
//             message
//         })
//         res.status(200).json({ success: true, message: `Email sent to ${user.email} successfully` })

//         await user.save({ validateBeforeSave: false });
//         user.getResetPassword = undefined;
//         user.resetPasswordExpire = undefined;
//     } catch (error) {
//         return next(new ErrorHandler(error, 500))
//     }

// })
// Route:3: log out route
router.get('/logout', (req, res, next) => {
    try {

        res.cookie("token", null, {
            expire: new Date(Date.now),
            httpOnly: true
        })
        res.status(200).json({ success: true, message: "logged out user." })
    } catch (error) {
        next(new ErrorHandler(error, 500))
    }
})

// Route:4: get user details
router.get('/getuser',isAuthenticatedUser, async(req, res, next)=>{
    try {
        const user = await User.findById(req.user.id)
        if(!user){
            return next(new ErrorHandler("Not able to find the user details", 404))
        }
        res.status(200).json({success:true, user})
        
    } catch (error) {
        return next(new ErrorHandler(error, 400))
    }

})

// Route:5: update user password
router.put('/updatepassword', isAuthenticatedUser, async(req, res, next)=>{
    try {
        
        const user = await User.findById(req.user.id).select("+password")
        const passwordCompare = await user.comparePassword(req.body.oldPassword);
        if (!passwordCompare) {
            return next(new ErrorHandler("Invalid email or password", 401));
        }
        if(req.body.newPassword !== req.body.confirmPassword){
            return next(new ErrorHandler("Password does not match.", 400))
        }
        user.password = req.body.newPassword
        await user.save()
        sendToken(user, 200, res)
    } catch (error) {
        res.status(400).json({success:false, message:"Invalid credatils.", error})
    }
})

// Route:5: update user profile
router.put('/updateprofile', isAuthenticatedUser, async(req, res, next)=>{
    try {
        const newUserData = {
            //make sure user required name and email in your frontend
            name:req.body.name,
            email:req.body.email,
        }
        if(!req.body.name || !req.body.email){
            return next(new ErrorHandler("Please enter your name and password to update your profile.", 404))
        }
        //TODO Cloudinary
        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new:true,
            runValidators:true, 
            userFindModify:false
        })
        res.status(200).json({success:true, message:"Updated profile."})
    } catch (error) {
        res.status(400).json({success:false, message:"Invalid credatils.", error})
    }
})

// Route:6: get all user profile for the admin
router.get('/getalluser', isAuthenticatedUser,authrizeRoles("admin"), async(req, res, next)=>{
    try {
       const users = await User.find();
        res.status(200).json({success:true, users});
    } catch (error) {
        res.status(400).json({success:false, message:"Not able to find the user.", error});
    }
})

// Route:7: get single user profile for the admin
router.get('/getsingleuser/:id', isAuthenticatedUser,authrizeRoles("admin"), async(req, res, next)=>{
    try {
       const user = await User.findById(req.params.id);
       if(!user){
        return next(new ErrorHandler(`Not able to find the user with user id: ${req.params.id}.`, 404))
       }
        res.status(200).json({success:true, user});
    } catch (error) {
        res.status(400).json({success:false, message:"Not able to find the user.", error});
    }
})

// Route:8: update the user role
router.put('/updateuserrole', isAuthenticatedUser,authrizeRoles("admin"), async(req, res, next)=>{
    try {
        const newUserData = {
            //make sure user required name and email in your frontend
            name:req.body.name,
            email:req.body.email,
            role:req.body.role,
        }
        if(!req.body.name || !req.body.email || !req.body.role){
            return next(new ErrorHandler("Please enter your name, password and role to update your profile.", 404))
        }
        //TODO Cloudinary
        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new:true,
            runValidators:true, 
            userFindModify:false
        })
        res.status(200).json({success:true, message:"Updated profile."})
    } catch (error) {
        res.status(400).json({success:false, message:"Invalid credatils.", error})
    }
})

// Route:9: deleting the user 
router.delete('/deletuser/:id', isAuthenticatedUser,authrizeRoles("admin"), async(req, res, next)=>{
    try {
        // we will remove cloudnery leater
       const user = await User.findByIdAndDelete(req.params.id, req.user)
        if(!user){
            return next(new ErrorHandler(`Not able to find the user you want to delet id:${req.params.id}`, 404))
        }
        res.status(200).json({success:true, message:"Deleted user."})
    } catch (error) {
        res.status(400).json({success:false, message:"Invalid credatils.", error})
    }
})
module.exports = router;