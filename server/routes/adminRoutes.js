const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

router.get("/dashboard", protect, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  res.json({ message: "Welcome, Admin!" });
});

module.exports = router;
