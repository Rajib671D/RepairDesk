const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format"
    });
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message
    }));

    return res.status(400).json({
      success: false,
      message: "Database validation failed",
      errors
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value already exists"
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};

module.exports = errorHandler;