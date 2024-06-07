const mongoose= require('mongoose');
const variationSchema= new mongoose.Schema({
    ram: {
        type:String,
        required:false
    },
    storage: {
        type: String,
        required:false
    },
    color:{
        type:String,
        required:true
    },
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Products',
        required:true
    }
})

const variationCollection= mongoose.model('ProductVariation', variationSchema);
module.exports= variationCollection;