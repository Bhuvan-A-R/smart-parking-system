const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  otp: { type: String }, // OTP for email verification
  otpExpiry: { type: Date }, // OTP expiration time
});

module.exports = mongoose.model("User", userSchema);
