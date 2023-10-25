require("dotenv").config()
const mongoose = require('mongoose');
const {Schema} = mongoose;
const validator = require('validator')
const bcrypt = require("bcrypt")
var jwt = require('jsonwebtoken');

const userSchema = new Schema({
    name:{
        type:String,
        required:[true, "Please enter your name."],
        minLength:[3, "Name can not be less than 3 chachters"],
        maxLength:[10, "Name can not be more than 10 chachters"],
    },
    email:{
        type:String,
        required:[true, "Please enter you email."],
        unique:true,
        validator:[validator.isEmail, "Please enter your valid email."]
    },
    password:{
        type:String,
        required:[true, "Please enter your password."],
        maxLength:[8, "Password can not be more than 10 chachters"],
    },
    avatar:{
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        },
    role:{
        type:String,
        default:"user"
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
});
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})
// JWT TOKEN
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    })
}
// compare password
userSchema.methods.comparePassword = async function(enterPassword){
    return await bcrypt.compare(enterPassword, this.password)
}

module.exports = mongoose.model("User", userSchema)