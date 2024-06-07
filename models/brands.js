const mongoose= require('mongoose');

const brandSchema =new  mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
})

const brand = mongoose.model('Brand', brandSchema)
module.exports= brand