const express = require('express');
const Order = require('../models/orderModle');
const Product = require('../models/productModel')
const ErrorHandler = require('../errorHandler/errorHandler');
const { isAuthenticatedUser, authrizeRoles } = require('../middleware/auth');
const router = express.Router();

// Make sure to required payment info of id and status in frontend
// Route:1: Creating order route
router.post('/createorder', isAuthenticatedUser, async (req, res, next) => {
    try {
        // getting all data from req.body
        const { shippingInfo, orderItems, payementInfo, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;
        // creating orders
        const order = await Order.create({ shippingInfo, orderItems, payementInfo, itemsPrice, shippingPrice, taxPrice, totalPrice, paidAt: Date.now(), user: req.user._id });

        res.status(200).json({ success: true, message: "Order created successfully.", order })

    } catch (error) {
        res.status(400).json({ success: false, message: "Not able to complte your request for some error occard." })
    }
})

// Route:2: getting single order
router.get('/getsingleorder/:id', isAuthenticatedUser, authrizeRoles("admin"), async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email");
        if (!order) {
            return next(new ErrorHandler("Not able to find the order you are looking for.", 404))
        }
        res.status(200).json({ success: true, order })
    } catch (error) {
        res.status(400).json({ success: false, message: "Not able to fullfil your request for some error occard." })
    }
})
// Route:3: get login user order
router.get('/myorders', isAuthenticatedUser, async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id })
        res.status(200).json({ success: true, orders })
    } catch (error) {
        res.status(400).json({ success: false, message: "Not able to fullfil your request for some error occard." })
    }
})

// Route:4: get all orders for the admin
router.get('/getallorders', isAuthenticatedUser, authrizeRoles("admin"), async (req, res) => {
    try {
        const orders = await Order.find()
        let totalAmount = 0;
        orders.forEach(order => {
            totalAmount += order.totalPrice
        })
        res.status(200).json({ succes: true, orders })
    } catch (error) {
        res.status(400).json({ succes: false, message: "Not able to fullfill you request for some error" })
    }


})

// Route:4: update orders status ---> admin
router.put('/updateorderstatus/:id', isAuthenticatedUser, authrizeRoles("admin"), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
          return next(new ErrorHandler("Order not found with this Id", 404));
        }
      
        if (order.orderStatus === "Delivered") {
          return next(new ErrorHandler("You have already delivered this order", 400));
        }
      
        if (req.body.status === "Shipped") {
          order.orderItems.forEach(async (o) => {
            await updateStock(o.product, o.quantity);
          });
        }
        order.orderStatus = req.body.status;
      
        if (req.body.status === "Delivered") {
          order.deleverdAt = Date.now();
        }
      
        await order.save({ validateBeforeSave: false });
        res.status(200).json({
          success: true,
          order
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({ succes: false, message: "Not able to fullfill you request for some error" })
    }


})
// function for updating the stock
async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    product.stock -= quantity
    await product.save({ validateBeforeSave: false });
}

// Route:5: delete orders status ---> admin
router.delete('/deleteorder/:id', isAuthenticatedUser, authrizeRoles("admin"), async (req, res, next) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id)
        if (!order) {
            return next(new ErrorHandler("Not able to find the order you are looking for.", 404))
        }
        await order.remove()
        res.status(200).json({ succes: true, message: "Your order hasbeen deleted successfully", order })
    } catch (error) {
        console.error(error)
        res.status(400).json({ succes: false, message: "Not able to fullfill you request for some error" })
    }


})

module.exports = router