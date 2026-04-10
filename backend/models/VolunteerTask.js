import mongoose from 'mongoose';

const volunteerTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Task location is required'],
      trim: true,
    },
    urgency: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
    },
    assigned: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AidRequest',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('VolunteerTask', volunteerTaskSchema);
