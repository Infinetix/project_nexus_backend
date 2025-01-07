const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user', 'manager'], default: 'user' },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invitation', InvitationSchema);
