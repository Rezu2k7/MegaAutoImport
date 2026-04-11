const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    makeModel: { type: String, required: true },
    
    // Financial Breakdown
    auctionPrice: { type: Number, required: true },
    transportPrice: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    
    vin: { type: String, required: true, unique: true },
    dealerId: { type: String, required: true },
    images: [{ type: String }],
    status: { type: String, default: 'Purchased' },
    isFeatured: { type: Boolean, default: false },
    documents: [{ originalName: String, filename: String }],

    // Logistics & Auction Data
    purchaseDate: { type: String, default: '' },
    auctionName: { type: String, default: '' },
    lotNumber: { type: String, default: '' },
    buyLocation: { type: String, default: '' },
    containerNumber: { type: String, default: '' },
    containerCode: { type: String, default: '' },

    // NEW: Recipient Details
    recipientFirstName: { type: String, default: '' },
    recipientLastName: { type: String, default: '' },
    recipientId: { type: String, default: '' },
    recipientPhone: { type: String, default: '' }

}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);