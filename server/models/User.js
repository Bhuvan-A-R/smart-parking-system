const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  vehicleType: { type: String, enum: ["Bike", "Car"], required: true },
  vehicleNumber: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "sub-admin", "user"], default: "user" },
  otp: { type: String }, // OTP for email verification
  otpExpiry: { type: Date }, // OTP expiration time
  otpVerified: { type: Boolean, default: false }, // OTP verification status
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }, // Last login timestamp
  lastLogout: { type: Date }, // Last logout timestamp
});

module.exports = mongoose.model("User", userSchema);
