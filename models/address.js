const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'users',
        required: true
    },
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
        
    },
    address_type:{
        type:String,
        possibleValues:['home','work']
    },
    createdAt:{
        type:Date,
        default: Date.now
    }
})

const address = mongoose.model('Address',addressSchema);
module.exports = address;