require('dotenv').config();
const mongoose = require('mongoose');


const url = 'mongodb://127.0.0.1:27017/ecommerceProduct';
const connectTomongo = async()=>{
    try {
        await mongoose.connect(url)
        console.log("mongoose database connected successfully.")
    } catch (error) {
        console.log({error:"Some error occard to connect to mongodb server."})
    }
    
}
module.exports = connectTomongo;
