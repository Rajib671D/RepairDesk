const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const { deviceSchema } = require("../utils/validation");

const {
  createDevice,
  getDevices,
  getDeviceById,
  updateDevice,
  deleteDevice
} = require("../controllers/deviceController");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("admin", "receptionist"),
  validate(deviceSchema),
  createDevice
);

router.get("/", protect, getDevices);

router.get(
  "/:id",
  protect,
  validateObjectId("id"),
  getDeviceById
);

router.put(
  "/:id",
  protect,
  authorize("admin", "receptionist"),
  validateObjectId("id"),
  updateDevice
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validateObjectId("id"),
  deleteDevice
);

module.exports = router;