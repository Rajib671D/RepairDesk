const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { getDashboardStats } = require("../controllers/dashboardController");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("admin", "receptionist"),
  getDashboardStats
);

module.exports = router;