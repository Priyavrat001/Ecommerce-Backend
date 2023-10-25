const express = require('express');
const Product = require('../models/productModel')
const router = express.Router()
const ErrorHandler = require("../errorHandler/errorHandler")
// const catchAsyncError = require("../errorHandler/catchAsyncError");
const ApiFeatures = require('../middleware/apiFeature');
const { isAuthenticatedUser, authrizeRoles } = require('../middleware/auth');

// Route:1: create  product for admin from "/api/product/createproduct"
router.post('/createproduct',isAuthenticatedUser,authrizeRoles("admin"),  async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(200).json({
        sucess: true,
        product
    });
  } catch (error) {
   res.status(400).json({success:false, error:"Internal server error"}) 
  }
    
})
// Route:2: get all product from "/api/product/updateproduct"
router.get('/getallproduct',async (req, res, next) => {
  try {
    const resultPage = 5;
    const apiFeature = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPage);
    const product = await apiFeature.query;
    res.status(200).json({
        sucess: true,
        product
    })
  } catch (error) {
    res.status(400).json({success:false, error:"Internal server error"}) 
  }

})
// Route:3: update all product from "/api/product/updateproduct"
router.put('/updateproduct/:id',isAuthenticatedUser,authrizeRoles("admin"),  async (req, res, next) => {
  try {
    
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404))
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true, useFindAndModify: false })
    res.status(200).json({
        sucess: true,
        product
    })
  } catch (error) {
    res.status(400).json({success:false, error:"Internal server error"}) 
  }
})
// Route:4: delete product by id from "/api/product/updateproduct"
router.delete('/deleteproduct/:id',isAuthenticatedUser,authrizeRoles("admin"),  async (req, res, next) => {
  try {
    
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
  } catch (error) {
    res.status(400).json({success:false, error:"Internal server error"}) 
  }
  
  
  })
  // Route:5: get a single product by id from "/api/product/updateproduct"
  router.get('/getsingleproduct/:id', async(req, res, next)=>{
    try {
      
      const product = await Product.findById(req.params.id)
      if (!product) {
          return next(new ErrorHandler("Product not found", 404))
      }
        res.status(200).json({
          sucess: true,
          product
        })
    } catch (error) {
      res.status(400).json({success:false, error:"Internal server error"}) 
    }
  })
  

module.exports = router;