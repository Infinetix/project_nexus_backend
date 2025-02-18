const mongoose = require('mongoose');
const NexusActivityLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    activity_id:{type:String},
    performedBy: { type: String, required: true },  // user_id or email
    role: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: JSON, default:{} }  // Additional data related to the action
});

module.exports = mongoose.model('NexusActivityLog', NexusActivityLogSchema);