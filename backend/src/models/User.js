import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['victim', 'volunteer', 'admin'], default: 'victim' },
  isTrusted: { type: Boolean, default: false },
  googleId: { type: String },
  facebookId: { type: String },
  githubId: { type: String },
}, { timestamps: true });

export default mongoose.model('User', userSchema);