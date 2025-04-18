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
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://192.168.29.67:3000",
    methods: ["GET", "POST"],
  },
});

// Allow requests from your frontend origin
app.use(
  cors({
    origin: ["http://192.168.29.67:3000"], // Add your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
    const payments = await Payment.find().sort({ date: -1 }).limit(5); // Ensure `Payment` is defined
    const totalMoneyCollected = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    res.json({
      lastFivePayments: payments,
      totalMoneyCollected: totalMoneyCollected[0]?.total || 0,
    });
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, io };
