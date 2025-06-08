
import mongoose from 'mongoose';

const polishSchema = new mongoose.Schema({
  name: String,
  hex: String,
  description: String,
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  likedPolishes: [polishSchema],
});

export default mongoose.model('User', userSchema);

