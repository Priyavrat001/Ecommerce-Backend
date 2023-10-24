const express = require('express');
const router = express.Router();
const User = require("../models/userModels");
const ErrorHandler = require('../errorHandler/errorHandler');

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
        const token = user.getJWTToken();
        res.status(200).json({success:true, token})
    } catch (error) {
        next(new ErrorHandler(error, 404))
    }
})
module.exports = router;