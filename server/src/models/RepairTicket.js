const mongoose = require("mongoose");

const repairTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true
    },
    problem: {
      type: String,
      required: true,
      trim: true
    },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    status: {
      type: String,
      required: true,
      enum: [
        "received",
        "diagnosing",
        "waiting_for_parts",
        "repairing",
        "testing",
        "ready",
        "delivered"
      ],
      default: "received"
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    expectedDate: {
      type: Date
    },
    cost: {
      type: Number,
      default: 0,
      min: 0
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const RepairTicket = mongoose.model("RepairTicket", repairTicketSchema);

module.exports = RepairTicket;