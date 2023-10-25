const mongoose = require('mongoose');
const {Schema} = mongoose;
const productSchema = new Schema({
    name:{
        type:String,
        required:[true, "Enter the product name."],
        trim:true
    },
    description:{
        type:String,
        required:[true, "Enter the product description."]
    },
    price:{
        type:Number,
        required:[true, "Please enter the product price."],
        maxLength:[8, "Price cannot be exceed 8 chareters."]
    },
    rating:{
        type:Number,
        default:0
    },
    images:[
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        required:[true, "Please enter the catagory."]
    },
    stock:{
        type:Number,
        required:[true, "Please enter the stock."],
        maxLength:[4, "Stock cannot exceed 4 characters."],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[{
      name:{
        type:String,
        required:true
      },
      rating:{
        type:Number,
        required:true,

      },
      comment:{
        type:String,
        required:true
      }
    }],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
        require:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('Product', productSchema)