const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  schoolName: { type: String, required: true },
  city: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'avatar1' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
