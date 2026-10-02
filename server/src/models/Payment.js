const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    method: {
      type: String,
      required: true,
      enum: ["cash", "card", "upi", "bank_transfer"]
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed"],
      default: "completed"
    },
    transactionId: {
      type: String,
      trim: true
    },
    paidAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;