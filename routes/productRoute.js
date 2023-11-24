const express = require('express');
const Product = require('../models/productModel');
const router = express.Router();
const ErrorHandler = require("../errorHandler/errorHandler");
// const catchAsyncError = require("../errorHandler/catchAsyncError");
const ApiFeatures = require('../middleware/apiFeature');
const { isAuthenticatedUser, authrizeRoles } = require('../middleware/auth');

// Route:1: create  product for admin from "/api/product/createproduct"
router.post('/createproduct', isAuthenticatedUser, authrizeRoles("admin"), async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(200).json({
      sucess: true,
      product
    });
  } catch (error) {
    res.status(400).json({ success: false, error: "Internal server error" })
  }

})
// Route:2: get all product from "/api/product/updateproduct"
router.get('/getallproduct', async (req, res, next) => {
  try {
    const resultPage = 5;
    const productCount= await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPage);
    const product = await apiFeature.query;
    // console.log(product, productCount)
    res.status(200).json(product)
  } catch (error) {
    res.status(400).json({ success: false, error: "Internal server error" })
  }

})
// Route:3: update all product from "/api/product/updateproduct"
router.put('/updateproduct/:id', isAuthenticatedUser, authrizeRoles("admin"), async (req, res, next) => {
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
    res.status(400).json({ success: false, error: "Internal server error" })
  }
})
// Route:4: delete product by id from "/api/product/updateproduct"
router.delete('/deleteproduct/:id', isAuthenticatedUser, authrizeRoles("admin"), async (req, res, next) => {
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
    res.status(400).json({ success: false, error: "Internal server error" })
  }


})
// Route:5: adding review and comment from "/api/product/review"
router.put('/review', isAuthenticatedUser, async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.ratings = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
      avg += rev.ratings;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true
    });
  } catch (error) {
    // Handle any other potential errors here
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error
    });
  }
});

// Route:6: geting all review and comment from "/api/product/getreview"
router.get('/getreview', async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.id)
    if (!product) {
      return next(new ErrorHandler(`Product not found on this id:${req.query.id}`, 404))
    }
    res.status(200).json({ success: true, reviews: product.reviews })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error
    });
  }
})
// Route:6: deleting all review and comment from "/api/product/deletereview"
router.delete('/deletereview', isAuthenticatedUser, async (req, res, next) => {
  // try {
    const product = await Product.findById(req.query.productId);
    if (!product) {
      return next(new ErrorHandler(`Product not found on this id:${req.query.productId}`, 404));
    }
    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id)

    let avg = 0;

    reviews.forEach((rev) => {
      avg += rev.ratings;
    });

    const ratings = avg / reviews.length;
    const numOfReviews = reviews.length

    await Product.findByIdAndUpdate(req.query.id, {
      reviews, ratings, numOfReviews
    },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false
      })

    res.status(200).json({ success: true})
  // } catch (error) {
    res.status(500).json({
      success: false,
      message: "Not able to delete the product. ",
    });
  // }
})
module.exports = router;