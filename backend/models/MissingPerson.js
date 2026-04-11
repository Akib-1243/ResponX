import mongoose from "mongoose";

const MissingPersonSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['female', 'male', 'other'],
    required: true
  },
  vulnerability: {
    type: String,
    enum: ['none', 'child', 'elderly', 'medical'],
    default: 'none'
  },
  lastLocation: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  contactNumber: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['critical', 'high', 'normal'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['missing', 'found'],
    default: 'missing'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  foundAt: {
    type: Date
  }
}, { timestamps: true });

const MissingPersonModel = mongoose.models.MissingPerson || mongoose.model("MissingPerson", MissingPersonSchema);

export default MissingPersonModel;
