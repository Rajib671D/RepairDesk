const mongoose = require("mongoose");

const validateObjectId = (paramName) => {
  return (req, res, next) => {
    try {
      const id = req.params[paramName];

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format"
        });
      }

      next();
    } catch (error) {
      console.error("Validate ObjectId error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Something went wrong while validating the ID"
      });
    }
  };
};

module.exports = validateObjectId;