const mongoose = require('mongoose');

const CategoryofferSchema = new mongoose.Schema({

  offerName : {
    type : String,
    required : true 
  },

  offerDiscountValue :{
    type : Number,
    required:true
  },

  category :{
    type : mongoose.Schema.Types.ObjectId,
    ref:'Category',
    required : true
  },
  startDate: { type: Date, required: true },

  endDate :{
    type : Date,
    require : true
  },
  
  isDeleted :{
    type : Boolean,
    required : true,
    default : false
  },
  description :{
    type : String,
    required : true
  },
  expired:{type:Boolean,default:false}

});

const offerModel = new mongoose.model('offers',CategoryofferSchema);

module.exports = offerModel;