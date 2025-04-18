const express = require("express");
const {
  protect,
  adminOnly,
  subAdminOrAdmin,
} = require("../middleware/authMiddleware");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const router = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;

router.get("/dashboard", protect, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  res.json({ message: "Welcome, Admin!" });
});

// Add a new user (Admin only)
router.post("/add-user", protect, adminOnly, async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: "User added successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Error adding user", error: err.message });
  }
});

// Get all users (Admins and Sub-Admins)
router.get("/users", protect, subAdminOrAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
});

module.exports = router;
