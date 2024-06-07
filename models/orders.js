const mongoose = require('mongoose');

const ordersSchema = new mongoose.Schema({
   order_id: {type:String, required:true},
   date_of_order : { type: Date,
    default: Date.now
   },
   date_of_cancel : { type: Date
   },
   date_of_shipped : { type: Date
   },
   date_of_delivered : { type: Date
   },
   date_of_processed : { type: Date
   },
   date_of_return : { type: Date
   },
   user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'users',
    required:true
   },
   status:{
    type:String,
    possibleValues:['placed','processed','shipped','delivered','cancelled','returned','payment-failed'],
    default:'placed'
   },
   items:[
    {
        product_var_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductVariation', 
            required: true  
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }]
   ,
   payment_type:{
    type:String,
    possibleValues:['online','cod']
   },
   shipping_address:{
    name : {
        type:String,
        required: true
    },
    mobile : {
        type: Number,
        required: true
    },
    pincode:{
        type: Number,
        required:true
    },
    address:{
        type: String,
        required:true
    },
    locality:{
        type:String,
        required:true
    },
    district:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    }, 
    country:{
        type:String,
        
    }
   },
   payment_status:{
    type:String,
    possibleValues:['completed','pending'],
    required:true
   },
   total_amount:{
    type:Number ,
    required:true
   },
   sub_total:{
    type:Number ,
    required:true
   },
   shipping_charge:{
    type:Number ,
    required:true
   },
   coupon_applied :{
    type:String
   },
   discount_amount:{
    type:Number,
    default :0
   },
   cancellation_reason:{type:String}

})

const orders = mongoose.model('Orders', ordersSchema)
module.exports= orders 