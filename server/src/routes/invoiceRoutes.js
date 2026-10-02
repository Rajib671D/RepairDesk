const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const { invoiceSchema } = require("../utils/validation");
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} = require("../controllers/invoiceController");

const router = express.Router();

router.post("/", protect, authorize("admin", "receptionist"), validate(invoiceSchema), createInvoice);
router.get("/", protect, authorize("admin", "receptionist"), getInvoices);
router.get("/:id", protect, authorize("admin", "receptionist"), validateObjectId("id"), getInvoiceById);
router.put("/:id", protect, authorize("admin", "receptionist"), validateObjectId("id"), updateInvoice);
router.delete("/:id", protect, authorize("admin"), validateObjectId("id"), deleteInvoice);

module.exports = router;