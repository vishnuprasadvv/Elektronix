const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', 
        required: true
    },
    items: [
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
        }
    ]
});

module.exports = mongoose.model('Cart', cartSchema);
