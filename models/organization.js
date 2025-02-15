const mongoose = require('mongoose');
const OrganizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    logo: { type: String },
    description: { type: String },
    email: { type: String, required: true, unique: true },
    type: { type: String, enum: ['small', 'medium', 'large'], default: 'small' },
    compId: { type: String, required: true, unique: true },
    org_id: { type: String, required: true, unique: true },
    active:{type: Boolean,default:true},
    cost:{type:Number,default:0},
    userCount:{type:Number,default:1},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Organization', OrganizationSchema);