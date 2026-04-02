const mongoose = require('mongoose');

const CmtSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    reviewText: {
        type: String,
        required: true
    },
    replies: [{
        replierType: {
            type: String,
            enum: ['User', 'Admin'],
            required: true
        },
        replierId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'replies.replierType' 
        },
        replyText: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Cmt', CmtSchema);
