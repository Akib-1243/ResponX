const mongoose = require('mongoose');

const aidRequestSchema = new mongoose.Schema({
  victim: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  people: { type: Number, required: true },
  location: { type: String, required: true },
  urgency: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  needs: [{ type: String }],
  description: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'dispatched'], default: 'pending' },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('AidRequest', aidRequestSchema);