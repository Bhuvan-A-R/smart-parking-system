const mongoose = require("mongoose");

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: String,
  isAvailable: { type: Boolean, default: true },
  currentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  bookingStart: Date,
  bookingEnd: Date,
});

module.exports = mongoose.model("ParkingSlot", parkingSlotSchema);
