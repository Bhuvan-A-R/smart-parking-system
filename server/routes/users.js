const express = require("express");
const User = require("../models/User");
const Slot = require("../models/Slot");
const router = express.Router();

// Update vehicle details
router.post("/update-vehicle", async (req, res) => {
  const { vehicleType, vehicleNumber } = req.body;
  const userId = req.user.id; // Assuming user ID is available in the request

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the vehicle already exists
    const existingVehicle = user.vehicles.find(
      (v) => v.vehicleNumber === vehicleNumber
    );
    if (existingVehicle) {
      return res.status(400).json({ error: "Vehicle already exists" });
    }

    // Add the new vehicle
    user.vehicles.push({ vehicleType, vehicleNumber });
    await user.save();

    res.json({
      message: "Vehicle details updated successfully",
      vehicles: user.vehicles,
    });
  } catch (err) {
    console.error("Error updating vehicle details:", err); // Log the error
    res.status(500).json({ error: "Failed to update vehicle details" });
  }
});

// Get user's vehicles
router.get("/vehicles", async (req, res) => {
  const userId = req.user.id; // Assuming user ID is available in the request

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ vehicles: user.vehicles });
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

// Get users without booked slots
router.get("/unbooked-users", async (req, res) => {
  try {
    // Find all users
    const allUsers = await User.find({ role: "user" });

    // Find users who have booked slots
    const bookedUsers = await Slot.find({ userId: { $ne: null } }).distinct(
      "userId"
    );

    // Filter users who have not booked any slots
    const unbookedUsers = allUsers.filter(
      (user) => !bookedUsers.includes(user._id.toString())
    );

    res.json(unbookedUsers);
  } catch (err) {
    console.error("Error fetching unbooked users:", err);
    res.status(500).json({ error: "Failed to fetch unbooked users" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
