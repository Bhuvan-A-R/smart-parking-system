const express = require("express");
const Slot = require("../models/Slot");
const User = require("../models/User");
const router = express.Router();

// Get all slots
router.get("/", async (req, res) => {
  try {
    const slots = await Slot.find().populate("userId", "name email"); // Populate user details
    res.json(slots);
  } catch (err) {
    console.error("Error fetching slots:", err);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

// Book a slot
router.post("/book/:slotId", async (req, res) => {
  const { slotId } = req.params;
  const { userId } = req.body;

  try {
    const slot = await Slot.findOne({ id: slotId });

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    if (slot.status === "occupied") {
      return res.status(400).json({ error: "Slot is already occupied" });
    }

    slot.status = "occupied";
    slot.userId = userId;
    await slot.save();

    res.json({ message: "Slot booked successfully", slot });
  } catch (err) {
    console.error("Error booking slot:", err);
    res.status(500).json({ error: "Failed to book slot" });
  }
});

// Free a slot
router.post("/free/:slotId", async (req, res) => {
  const { slotId } = req.params;

  try {
    const slot = await Slot.findOne({ id: slotId });

    if (!slot || slot.status === "free") {
      return res
        .status(400)
        .json({ error: "Slot is already free or does not exist" });
    }

    slot.status = "free";
    slot.userId = null;
    await slot.save();

    res.json({ message: "Slot freed successfully", slot });
  } catch (err) {
    console.error("Error freeing slot:", err);
    res.status(500).json({ error: "Failed to free slot" });
  }
});

// Assign slots
router.post("/assign", async (req, res) => {
  const { slots } = req.body;

  try {
    // Clear existing slots
    await Slot.deleteMany({});

    // Insert new slots
    await Slot.insertMany(slots);

    res.json({ message: "Slots assigned successfully", slots });
  } catch (err) {
    console.error("Error assigning slots:", err);
    res.status(500).json({ error: "Failed to assign slots" });
  }
});

// Clear all slots
router.delete("/clear", async (req, res) => {
  try {
    await Slot.deleteMany({});
    res.json({ message: "All slots cleared successfully" });
  } catch (err) {
    console.error("Error clearing slots:", err);
    res.status(500).json({ error: "Failed to clear slots" });
  }
});

// Mark slot as leaving
router.post("/leaving/:slotId", async (req, res) => {
  const { slotId } = req.params;

  try {
    const slot = await Slot.findOne({ id: slotId });

    if (!slot || slot.status === "free") {
      return res
        .status(400)
        .json({ error: "Slot is already free or does not exist" });
    }

    // Mark the slot as pending payment
    slot.paymentStatus = "pending";
    await slot.save();

    res.json({
      message: "Slot marked as leaving. Payment pending approval.",
      slot,
    });
  } catch (err) {
    console.error("Error marking slot as leaving:", err);
    res.status(500).json({ error: "Failed to mark slot as leaving" });
  }
});

// Approve payment and free the slot
router.post("/approve-payment/:slotId", async (req, res) => {
  const { slotId } = req.params;
  const { paymentMethod } = req.body;

  try {
    const slot = await Slot.findOne({ id: slotId });

    if (!slot || slot.status === "free") {
      return res
        .status(400)
        .json({ error: "Slot is already free or does not exist" });
    }

    const duration = Math.ceil(
      (Date.now() - new Date(slot.bookedAt).getTime()) / (1000 * 60 * 60)
    ); // Duration in hours
    const ratePerHour = slot.vehicleType === "bike" ? 10 : 20; // Example rates
    const amount = duration * ratePerHour;

    // Add payment to history
    slot.paymentHistory.push({
      userId: slot.userId,
      slotId: slot.id,
      amount,
      duration,
      paymentMethod,
    });

    // Mark slot as free
    slot.status = "free";
    slot.userId = null;
    slot.bookedAt = null;
    slot.paymentStatus = "approved";
    await slot.save();

    res.json({ message: "Payment approved and slot freed.", amount, duration });
  } catch (err) {
    console.error("Error approving payment:", err);
    res.status(500).json({ error: "Failed to approve payment" });
  }
});

// Get user booking details
router.get("/user-bookings/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const bookings = await Slot.find({ userId }).select("-_id -__v");
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ error: "Failed to fetch user bookings" });
  }
});

// Assign a slot to a user
router.post("/assign/:slotId", async (req, res) => {
  const { slotId } = req.params;
  const { userId } = req.body;

  try {
    const slot = await Slot.findOne({ id: slotId });

    if (!slot || slot.status === "occupied") {
      return res
        .status(400)
        .json({ error: "Slot is already occupied or does not exist" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Assign the slot to the user
    slot.status = "occupied";
    slot.userId = userId;
    slot.bookedAt = new Date();
    await slot.save();

    res.json({ message: "Slot assigned successfully", slot });
  } catch (err) {
    console.error("Error assigning slot:", err);
    res.status(500).json({ error: "Failed to assign slot" });
  }
});

// Handle payment for a slot
router.post("/pay/:slotId", async (req, res) => {
  const { slotId } = req.params;
  const { userId } = req.body;

  try {
    const slot = await Slot.findOne({ id: slotId });

    if (!slot || slot.status === "free") {
      return res
        .status(400)
        .json({ error: "Slot is not occupied or does not exist" });
    }

    const duration = Math.ceil(
      (Date.now() - new Date(slot.bookedAt).getTime()) / (1000 * 60 * 60)
    ); // Duration in hours
    const ratePerHour = slot.vehicleType === "bike" ? 10 : 20; // Example rates
    const amount = duration * ratePerHour;

    // Add payment to history
    slot.paymentHistory.push({
      userId,
      slotId,
      amount,
      duration,
    });

    // Mark slot as free
    slot.status = "free";
    slot.userId = null;
    slot.bookedAt = null;
    slot.paymentStatus = "approved";
    await slot.save();

    res.json({ message: "Payment successful", amount, duration });
  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

// Get past parking history for a user
router.get("/history/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const slots = await Slot.find({ "paymentHistory.userId": userId });
    const history = slots.flatMap((slot) =>
      slot.paymentHistory.filter(
        (payment) => payment.userId.toString() === userId
      )
    );

    res.json(history);
  } catch (err) {
    console.error("Error fetching payment history:", err);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
});

module.exports = router;
