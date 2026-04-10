import mongoose from 'mongoose';

const aidRequestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['Medical Supplies', 'Food & Water', 'Shelter', 'Clothing', 'Rescue', 'Other'],
    },
    urgency: {
      type: String,
      required: true,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'High',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    people: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved'],
      default: 'open',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('AidRequest', aidRequestSchema);
