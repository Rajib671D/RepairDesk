const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const { paymentSchema } = require("../utils/validation");
const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/", protect, authorize("admin", "receptionist"), validate(paymentSchema), createPayment);
router.get("/", protect, authorize("admin", "receptionist"), getPayments);
router.get("/:id", protect, authorize("admin", "receptionist"), validateObjectId("id"), getPaymentById);
router.put("/:id", protect, authorize("admin"), validateObjectId("id"), updatePayment);
router.delete("/:id", protect, authorize("admin"), validateObjectId("id"), deletePayment);

module.exports = router;