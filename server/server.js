require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const slotRoutes = require("./routes/slots");
const pricingRoutes = require("./routes/pricing");
const userRoutes = require("./routes/users");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const ParkingSlot = require("./models/ParkingSlot"); // Adjust the path as needed
const app = express();
const Slot = require("./models/Slot");
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://easy-parkers-sps.vercel.app:3000",
    methods: ["GET", "POST"],
  },
});

// Allow requests from your frontend origin
app.use(
  cors({
    origin: "https://easy-parkers-sps.vercel.app:3000", // Allow requests from your frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies to be sent with requests
  })
);

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Use auth routes
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

// Use admin routes
app.use("/api/admin", adminRoutes);

// Use slots routes
app.use("/api/slots", slotRoutes);

// Use pricing routes
app.use("/api/pricing", pricingRoutes);

// Use user routes
app.use("/api/users", userRoutes);

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.post("/api/slots/book/:slotId", async (req, res) => {
  const { slotId } = req.params;
  const { userId } = req.body;

  try {
    // Find the slot by its ID
    const slot = await ParkingSlot.findOne({ id: slotId });

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    if (slot.status === "occupied") {
      return res.status(400).json({ error: "Slot already booked" });
    }

    // Update slot details
    slot.status = "occupied";
    slot.userId = userId;
    slot.paymentStatus = "pending";
    slot.bookedAt = new Date();

    await slot.save();

    res.json({ message: "Slot booked successfully" });
  } catch (err) {
    console.error("Error booking slot:", err);
    res.status(500).json({ error: "Failed to book slot" });
  }
});

app.post("/api/slots/reset/:slotId", async (req, res) => {
  const { slotId } = req.params;

  try {
    const slot = await ParkingSlot.findOne({ slotNumber: slotId });

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    // Reset slot status
    slot.status = "free";
    slot.userId = null;
    slot.paymentStatus = null;
    slot.bookedAt = null;
    await slot.save();

    res.json({ message: "Slot reset successfully", slot });
  } catch (err) {
    console.error("Error resetting slot:", err);
    res.status(500).json({ error: "Failed to reset slot" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/api/admin/slots", async (req, res) => {
  try {
    const totalSlots = await ParkingSlot.countDocuments(); // Ensure `ParkingSlot` is defined and connected to the database
    res.json({ totalSlots });
  } catch (err) {
    console.error("Error fetching total slots:", err);
    res.status(500).json({ error: "Failed to fetch total slots" });
  }
});

app.get("/api/admin/payments", async (req, res) => {
  try {
    // Calculate the total money collected dynamically
    const totalMoneyCollected = await Slot.aggregate([
      { $unwind: "$paymentHistory" }, // Flatten the paymentHistory array
      { $group: { _id: null, total: { $sum: "$paymentHistory.amount" } } }, // Sum the amounts
    ]);

    // Fetch the last 5 payments from the paymentHistory array
    const lastFivePayments = await Slot.aggregate([
      { $unwind: "$paymentHistory" }, // Flatten the paymentHistory array
      { $sort: { "paymentHistory.paidAt": -1 } }, // Sort by paidAt in descending order
      { $limit: 5 }, // Limit to the last 5 payments
      {
        $project: {
          _id: 0,
          id: "$paymentHistory.slotId",
          amount: "$paymentHistory.amount",
          method: "N/A", // Placeholder for payment method
          date: "$paymentHistory.paidAt",
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

app.post("/api/admin/payments/add", async (req, res) => {
  const { slotId, amount, userId, duration } = req.body;

  try {
    // Find the parking slot by ID
    const slot = await Slot.findOne({ id: slotId });

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    // Add the new payment to the paymentHistory array
    const newPayment = {
      userId,
      slotId,
      amount,
      duration,
      paidAt: new Date(),
    };

    slot.paymentHistory.push(newPayment);

    // Increment the totalMoneyCollected field for this slot
    slot.totalMoneyCollected += amount;

    // Save the updated slot
    await slot.save();

    // Recalculate the totalMoneyCollected across all slots
    const totalMoneyCollected = await Slot.aggregate([
      { $unwind: "$paymentHistory" }, // Flatten the paymentHistory array
      { $group: { _id: null, total: { $sum: "$paymentHistory.amount" } } }, // Sum the amounts
    ]);

    // Update the totalMoneyCollected field in the database
    await Slot.updateMany(
      {},
      { $set: { totalMoneyCollected: totalMoneyCollected[0]?.total || 0 } }
    );

    res.status(200).json({ message: "Payment added successfully", slot });
  } catch (err) {
    console.error("Error adding payment:", err);
    res.status(500).json({ error: "Failed to add payment" });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, io };
