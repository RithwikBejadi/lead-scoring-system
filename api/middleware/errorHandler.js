function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: err.errors || err.message
    });
  }

  if (err.name === "LeadNotFoundError") {
    return res.status(404).json({
      error: err.message
    });
  }

  if (err.name === "DuplicateEventError") {
    return res.status(409).json({
      error: err.message
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid data format",
      message: err.message
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: "Duplicate entry",
      message: "Resource already exists"
    });
  }

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Not found",
    path: req.path
  });
}

module.exports = { errorHandler, notFoundHandler };
