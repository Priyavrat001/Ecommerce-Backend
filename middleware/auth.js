require("dotenv").config()
const ErrorHandler = require("../errorHandler/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

exports.isAuthenticatedUser = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return next(new ErrorHandler("Please login to access this resources.", 401))
        }
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
       req.user = await User.findById(decodedData.id)
    } catch (error) {
        res.status(400).json({ error:"Please Login to access the product.", success: false });
    }
    next()
}
exports.authrizeRoles = (...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
          return next(new ErrorHandler(`Role:${req.user.role} is not allowed to access the resource`,403))

        }
        next()
    }
}