const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    user:{type: mongoose.Schema.Types.ObjectId, 
        ref:'users',
        required:true},

    balance: { type: Number, default: 0 },
    transactions: [{
        type: { type: String, enum: ['credit', 'debit','refund'], required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now }
    }]
   
});

module.exports = mongoose.model('Wallet', walletSchema);