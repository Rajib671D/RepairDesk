const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

router.get("/admin-test", protect, authorize("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
    user: req.user
  });
});

module.exports = router;