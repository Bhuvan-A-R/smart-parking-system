const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

exports.subAdminOrAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "sub-admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admins or Sub-Admins only." });
  }
  next();
};
