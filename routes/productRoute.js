const express = require('express');
const Product = require('../models/productModel')
const router = express.Router()
const ErrorHandler = require("../errorHandler/errorHandler")
const catchAsyncError = require("../errorHandler/catchAsyncError")

// Route:1: create  product for admin from "/api/product/createproduct"
router.post(catchAsyncError('/createproduct', async (req, res, next) => {
    const product = await Product.create(req.body);
    res.status(200).json({
        sucess: true,
        product
    })

}))
// Route:2: get all product from "/api/product/updateproduct"
router.get(catchAsyncError('/getallproduct', async (req, res, next) => {
    const product = await Product.find();
    res.status(200).json({
        sucess: true,
        product
    })

}))
// Route:3: update all product from "/api/product/updateproduct"
router.put(catchAsyncError('/updateproduct/:id', async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true, useFindAndModify: false })
    res.status(200).json({
        sucess: true,
        product
    })
}))
// Route:4: delete product by id from "/api/product/updateproduct"
router.delete(catchAsyncError('/deleteproduct/:id', async (req, res, next) => {
  
      let { id } = req.params;
      let product = await Product.findById(id);
      if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }
      else {
        product = await Product.findByIdAndDelete(id, req.body)
      }
      res.status(200).json({
        sucess: true,
        message: "Your product is deleted sucessfully."
      })
  
  }))
  // Route:5: get a single product by id from "/api/product/updateproduct"
  router.get(catchAsyncError('/getsingleproduct/:id', async(req, res, next)=>{
    const product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }
      res.status(200).json({
        sucess: true,
        product
      })
  }))
  

module.exports = router;