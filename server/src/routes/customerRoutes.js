const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const { customerSchema } = require("../utils/validation");
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} = require("../controllers/customerController");

const router = express.Router();

router.post("/", protect, authorize("admin", "receptionist"), validate(customerSchema), createCustomer);
router.get("/", protect, getCustomers);
router.get("/:id", protect, validateObjectId("id"), getCustomerById);
router.put("/:id", protect, authorize("admin", "receptionist"), validateObjectId("id"), updateCustomer);
router.delete("/:id", protect, authorize("admin"), validateObjectId("id"), deleteCustomer);

module.exports = router;