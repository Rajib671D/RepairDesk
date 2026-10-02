const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ["mobile", "laptop", "tablet", "desktop", "other"]
    },
    brand: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    serialNumber: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Device = mongoose.model("Device", deviceSchema);

module.exports = Device;