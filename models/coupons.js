const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    description:{
        type: String,
    },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 1 },
    usageCount: { type: Number, default: 0 }
})
module.exports = mongoose.model('Coupon', CouponSchema);