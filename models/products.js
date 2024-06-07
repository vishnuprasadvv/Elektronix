const mongoose= require('mongoose');

//products schema

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    brand:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand', 
        required: true
    },
    description:{
        type:String,
        required: true
    },
    quantity:{
        type:Number,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    org_price:{
        type:Number,
        
    },
    image:[{
        type:String,
        required: true
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Reference the Category model
        required: true 
    },
    added_date:{
        type:Date,
        default: Date.now
    },
    rating:{
        type:Number,  
        default:0
    },
    is_featured:{
        type:Boolean,
        default:false
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    offer:{
        actualAmount:{type:Number},
        offerDiscount:{type:Number},
        offerName:{type:String}  ,
        offerPrice:{type:Number} ,
        offerDiscountPercentage:{type:Number}
    }
})

const products = mongoose.model('Products', productSchema);
module.exports= products;