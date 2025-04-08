const express = require("express");
const {
  registerUser,
  verifyOtp,
  loginUser,
  getUserDetails,
} = require("../controllers/authController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.get("/me", getUserDetails);

module.exports = router;
