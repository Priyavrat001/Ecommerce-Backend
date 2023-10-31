const express = require('express');
const Order = require('../models/orderModle');
const ErrorHandler = require('../errorHandler/errorHandler');
const router = express.Router();

// Route:1: Creating order route
router.get('/createorder', async (req, res, next) => {
    try {
        // getting all data from req.body
        const { shippingInfo, orderItems, payementInfo, itemPrice, shippingPrice, taxPrice, totalPrice } = req.body;

        // creating orders
        const order = await Order.create({ shippingInfo, orderItems, payementInfo, itemPrice, shippingPrice, taxPrice, totalPrice, paidAt:Date.now(), user:req.user.id });
        
        res.status(200).json({success:true, message:"Order created successfully."})

    } catch (error) {
        res.status(400).json({success:false, message:"Not able to create the order due to some error."})
    }
})

module.exports = router