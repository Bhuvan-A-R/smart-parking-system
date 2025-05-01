const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  status: { type: String, enum: ["free", "occupied"], default: "free" },
  vehicleType: { type: String, enum: ["bike", "car"], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  bookedAt: { type: Date, default: null },
  paymentStatus: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending",
  },
  paymentAmount: { type: Number, default: 0 },
  totalMoneyCollected: { type: Number, default: 0 },
  paymentHistory: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      slotId: String,
      amount: Number,
      duration: Number,
      paymentMethod: { type: String, enum: ["cash", "upi"], required: true },
      paidAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Slot", slotSchema);
