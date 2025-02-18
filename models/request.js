const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    reqType:{type:String},
    reqName:{type: String},
    reqDesc:{type:JSON},
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    req_id:{ type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', RequestSchema);
