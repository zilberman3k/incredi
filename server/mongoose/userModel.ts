import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true }
});

export const UserModel = mongoose.model('User', userSchema);
