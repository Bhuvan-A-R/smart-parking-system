const express = require("express");
const ParkingSlot = require("../models/ParkingSlot");
const router = express.Router();

// Get all slots
router.get("/slots", async (req, res) => {
  try {
    const slots = await ParkingSlot.find();
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

// Book a slot
router.post("/slots/book/:slotId", async (req, res) => {
  const { slotId } = req.params;
  const { vehicleNumber, duration } = req.body;

  try {
    const slot = await ParkingSlot.findOne({ slotNumber: slotId });
    if (!slot || !slot.isAvailable) {
      return res.status(400).json({ error: "Slot not available" });
    }

    slot.isAvailable = false;
    slot.currentUser = req.user._id; // Assuming user is authenticated
    slot.bookingStart = new Date();
    slot.bookingEnd = new Date(Date.now() + duration * 60 * 60 * 1000);
    await slot.save();

    res.json({ message: "Slot booked successfully", slot });
  } catch (err) {
    res.status(500).json({ error: "Failed to book slot" });
  }
});

module.exports = router;
