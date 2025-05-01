const express = require("express");
const {
  protect,
  adminOnly,
  subAdminOrAdmin,
} = require("../middleware/authMiddleware");
const User = require("../models/User");
const Slot = require("../models/Slot");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

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

// GET: Total money collected + last 5 payments
router.get("/payments", async (req, res) => {
  try {
    // Calculate the total money collected
    const totalMoneyCollected = await Slot.aggregate([
      { $unwind: "$paymentHistory" },
      { $group: { _id: null, total: { $sum: "$paymentHistory.amount" } } },
    ]);

    // Fetch the last 5 payments with user details
    const lastFivePayments = await Slot.aggregate([
      { $unwind: "$paymentHistory" },
      { $sort: { "paymentHistory.paidAt": -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users", // Collection name for users
          localField: "paymentHistory.userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $project: {
          _id: 0,
          id: "$paymentHistory.slotId",
          amount: "$paymentHistory.amount",
          method: "$paymentHistory.paymentMethod",
          date: {
            $dateToString: {
              format: "%Y-%m-%d %H:%M:%S",
              date: "$paymentHistory.paidAt",
              timezone: "Asia/Kolkata", // Convert to IST
            },
          },
          userName: { $arrayElemAt: ["$userDetails.name", 0] }, // Extract user name
        },
      },
    ]);

    res.json({
      lastFivePayments,
      totalMoneyCollected: totalMoneyCollected[0]?.total || 0,
    });
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// POST: Add a new payment
router.post("/payments/add", async (req, res) => {
  const { slotId, amount, userId, duration, paymentMethod } = req.body;

  try {
    // Validate required fields
    if (!slotId || !amount || !userId || !duration || !paymentMethod) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const slot = await Slot.findOne({ id: slotId });

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    const newPayment = {
      userId,
      slotId,
      amount,
      duration,
      paymentMethod,
      paidAt: new Date(),
    };

    // Add payment to history
    slot.paymentHistory.push(newPayment);

    // Free the slot
    slot.status = "free";
    slot.userId = null;
    slot.bookedAt = null;
    slot.paymentStatus = "pending"; // Set to pending for admin approval
    slot.paymentAmount = amount; // Set the payment amount

    await slot.save();

    res
      .status(200)
      .json({ message: "Payment added successfully and slot freed", slot });
  } catch (err) {
    console.error("Error adding payment:", err);
    res.status(500).json({ error: "Failed to add payment" });
  }
});

module.exports = router;
