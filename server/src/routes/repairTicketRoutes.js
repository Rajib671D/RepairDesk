const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const { repairTicketSchema } = require("../utils/validation");
const {
  createRepairTicket,
  getRepairTickets,
  getRepairTicketById,
  updateRepairTicket,
  deleteRepairTicket
} = require("../controllers/repairTicketController");

const router = express.Router();

router.post("/", protect, authorize("admin", "receptionist"), validate(repairTicketSchema), createRepairTicket);
router.get("/", protect, getRepairTickets);
router.get("/:id", protect, validateObjectId("id"), getRepairTicketById);
router.put("/:id", protect, authorize("admin", "technician"), validateObjectId("id"), updateRepairTicket);
router.delete("/:id", protect, authorize("admin"), validateObjectId("id"), deleteRepairTicket);

module.exports = router;