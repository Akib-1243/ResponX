import mongoose from 'mongoose';

const shelterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shelter name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'District / location is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Full address is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    total: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: [1, 'Total capacity must be at least 1'],
    },
    capacity: {
      type: Number,
      default: 0,
      min: [0, 'Occupancy cannot be negative'],
    },
    status: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    amenities: {
      type: [String],
      enum: ['Food', 'Medical', 'Wi-Fi', 'Showers', 'Childcare', 'Pets Allowed'],
      default: [],
    },
    open: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

/* Auto-compute status before every save */
shelterSchema.pre('save', function () {
  const ratio = this.capacity / this.total;
  if (ratio >= 0.8)      this.status = 'high';
  else if (ratio >= 0.5) this.status = 'medium';
  else                   this.status = 'low';
});

export default mongoose.model('Shelter', shelterSchema);
