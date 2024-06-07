const mongoose = require('mongoose');


const wishlistSchema =  mongoose.Schema({
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
            }
        }
    ]
});

module.exports = new mongoose.model('Wishlist', wishlistSchema);
