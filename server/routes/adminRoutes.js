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
const PDFDocument = require("pdfkit");
const { v4: uuidv4 } = require("uuid");

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
    const slots = await Slot.find({}).select("paymentHistory");
    const paymentHistory = slots.flatMap((slot) =>
      slot.paymentHistory.map((payment) => ({
        paymentId: payment.paymentId,
        amount: payment.amount,
        method: payment.paymentMethod,
        date: payment.paidAt,
        userName: payment.userId, // Replace with actual user name if needed
      }))
    );

    const totalMoneyCollected = paymentHistory.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    res.json({
      totalMoneyCollected,
      lastFivePayments: paymentHistory.slice(-5),
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
      paymentId: uuidv4(), // Generate a unique paymentId
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

    await slot.save();

    res
      .status(200)
      .json({ message: "Payment added successfully and slot freed", slot });
  } catch (err) {
    console.error("Error adding payment:", err);
    res.status(500).json({ error: "Failed to add payment" });
  }
});

router.get("/generate-invoice/:paymentId", async (req, res) => {
  const { paymentId } = req.params;

  try {
    // Fetch the slot and payment details
    const slot = await Slot.findOne({ "paymentHistory.paymentId": paymentId });
    if (!slot) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const payment = slot.paymentHistory.find((p) => p.paymentId === paymentId);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Fetch the user details
    const user = await User.findById(payment.userId);
    const userName = user ? user.name : "Unknown User";
    const userEmail = user ? user.email : "Unknown Email";

    // Generate the invoice as a PDF
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${paymentId}.pdf`
      );
      res.send(pdfData);
    });

    // Add a logo
    const logoPath = "logo.png"; // Replace with the actual path to your logo
    try {
      doc.image(logoPath, 45, 45, { width: 100 }).moveDown();
    } catch (err) {
      console.error("Error loading logo:", err);
    }

    // Add title
    doc
      .moveDown(2)
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("PARKING TICKET INVOICE", { align: "center" })
      .moveDown(10);

    // Add "From" section
    doc
      .moveDown(12)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("FROM", 50, 150)
      .font("Helvetica")
      .text("Company: Parking Solutions Pvt. Ltd.")
      .text("Address: 123 Parking Lane, City, State")
      .text("Phone: +91-9876543210")
      .text("Email: support@parkingsolutions.com")
      .moveDown(1);

    // Add "Details" section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("DETAILS", 300, 150)
      .font("Helvetica")
      .text(`Date: ${new Date(payment.paidAt).toLocaleDateString()}`, 300)
      .text(`Invoice No: ${payment.paymentId}`, 300)
      .text("Terms: Paid", 300)
      .moveDown(1);

    // Add "Bill To" section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("BILL TO", 50, 250)
      .font("Helvetica")
      .text(`User ID: ${payment.userId}`)
      .text(`Name: ${userName}`)
      .text(`Email: ${userEmail}`)
      .moveDown(1);

    // Add "Vehicle Information" section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("VEHICLE INFORMATION", 300, 250)
      .font("Helvetica")
      .text(`Slot ID: ${payment.slotId}`, 300)
      .text("Vehicle Type: Car", 300) // Replace with actual vehicle type
      .moveDown(1);

    // Add table header
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("DESCRIPTION", 50, 350)
      .text("QTY / HRS", 250, 350)
      .text("FEE / RATE", 350, 350)
      .text("AMOUNT", 450, 350)
      .moveDown(0.5);

    // Add table row
    doc
      .fontSize(12)
      .font("Helvetica")
      .text("Parking Fee", 50, 370)
      .text(`${payment.duration} hours`, 250, 370)
      .text("₹10/hour", 350, 370) // Replace with actual rate
      .text(`₹${payment.amount}`, 450, 370)
      .moveDown(1);

    // Add totals
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("SUBTOTAL", 350, 400)
      .text(`₹${payment.amount}`, 450, 400)
      .text("TOTAL", 350, 440)
      .text(`₹${payment.amount}`, 450, 440)
      .moveDown(2);

    // Add footer
    // Add footer
    doc
      .moveDown(5) // Add more vertical space before the footer
      .fontSize(10)
      .font("Helvetica")
      .text("Thank you for using our parking service!", { align: "center" })
      .moveDown(1);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("For any inquiries, contact us at support@parkingsolutions.com");

    doc.end();
  } catch (err) {
    console.error("Error generating invoice:", err);
    res.status(500).json({ error: "Failed to generate invoice" });
  }
});

router.post("/generate-invoice/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  const { userName, userEmail } = req.body;

  try {
    // Validate user input
    if (!userName || !userEmail) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    // Fetch the slot and payment details
    const slot = await Slot.findOne({ "paymentHistory.paymentId": paymentId });
    if (!slot) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const payment = slot.paymentHistory.find((p) => p.paymentId === paymentId);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Generate the invoice as a PDF
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${paymentId}.pdf`
      );
      res.send(pdfData);
    });

    // Add a logo
    const logoPath = "logo.png"; // Replace with the actual path to your logo
    try {
      doc.image(logoPath, 45, 45, { width: 100 }).moveDown();
    } catch (err) {
      console.error("Error loading logo:", err);
    }

    // Add title
    doc
      .moveDown(2)
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("PARKING TICKET INVOICE", { align: "center" })
      .moveDown(10);

    // Add "From" section
    doc
      .moveDown(12)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("FROM", 50, 150)
      .font("Helvetica")
      .text("Company: Parking Solutions Pvt. Ltd.")
      .text("Address: 123 Parking Lane, City, State")
      .text("Phone: +91-9876543210")
      .text("Email: support@parkingsolutions.com")
      .moveDown(1);

    // Add "Details" section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("DETAILS", 300, 150)
      .font("Helvetica")
      .text(`Date: ${new Date(payment.paidAt).toLocaleDateString()}`, 300)
      .text(`Invoice No: ${payment.paymentId}`, 300)
      .text("Terms: Paid", 300)
      .moveDown(1);

    // Add "Bill To" section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("BILL TO", 50, 250)
      .font("Helvetica")
      .text(`Name: ${userName}`)
      .text(`Email: ${userEmail}`)
      .moveDown(1);

    // Add "Vehicle Information" section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("VEHICLE INFORMATION", 300, 250)
      .font("Helvetica")
      .text(`Slot ID: ${payment.slotId}`, 300)
      .text("Vehicle Type: Car", 300) // Replace with actual vehicle type
      .moveDown(1);

    // Add table header
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("DESCRIPTION", 50, 350)
      .text("QTY / HRS", 250, 350)
      .text("FEE / RATE", 350, 350)
      .text("AMOUNT", 450, 350)
      .moveDown(0.5);

    // Add table row
    doc
      .fontSize(12)
      .font("Helvetica")
      .text("Parking Fee", 50, 370)
      .text(`${payment.duration} hours`, 250, 370)
      .text("₹10/hour", 350, 370) // Replace with actual rate
      .text(`₹${payment.amount}`, 450, 370)
      .moveDown(1);

    // Add totals
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("SUBTOTAL", 350, 400)
      .text(`₹${payment.amount}`, 450, 400)
      .text("TOTAL", 350, 440)
      .text(`₹${payment.amount}`, 450, 440)
      .moveDown(2);

    // Add footer
    doc
      .moveDown(5) // Add more vertical space before the footer
      .fontSize(10)
      .font("Helvetica")
      .text("Thank you for using our parking service!", { align: "center" })
      .moveDown(1);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("For any inquiries, contact us at support@parkingsolutions.com");

    doc.end();
  } catch (err) {
    console.error("Error generating invoice:", err);
    res.status(500).json({ error: "Failed to generate invoice" });
  }
});

module.exports = router;
