const errorHandler = (err, req, res, next) => {
  console.error("LỖI HỆ THỐNG:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "SERVER CRASHED";

  res.status(statusCode).json({
    error: message,
  });
};

module.exports = errorHandler;
