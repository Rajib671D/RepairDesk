const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { getReports } = require("../controllers/reportController");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("admin", "receptionist"),
  getReports
);

module.exports = router;