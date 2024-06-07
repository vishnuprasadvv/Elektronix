const mongoose= require('mongoose');
const otpSchema= new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'users'
    },
    otp:{
        type:String,

    },
    createdAt:Date,
    expiresAt:Date
    

})

const token= mongoose.model('Otp',otpSchema);
module.exports= token;