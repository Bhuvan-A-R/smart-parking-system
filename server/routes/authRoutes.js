const express = require("express");
const bcrypt = require("bcrypt");
const {
  registerUser,
  verifyOtp,
  loginUser,
  getUserDetails,
  logoutUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", getUserDetails);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
