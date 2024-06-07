const mongoose= require('mongoose');

const categorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
})

const category = mongoose.model('Category', categorySchema)
module.exports= category 