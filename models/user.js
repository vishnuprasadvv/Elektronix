const mongoose= require('mongoose')

//user schema

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        
    },
    address:{
        type:String,
        
    },
    password:{
        type:String,
        
    },
    joinDate:{
        type: Date,
        default:Date.now
    },
    status:{ 
        type:Boolean,
        default:true
    },
    isVerified:{
        type:Boolean,
        default:false
    }
    
})

//export schema

const collection= new mongoose.model('users',userSchema);

module.exports= collection;