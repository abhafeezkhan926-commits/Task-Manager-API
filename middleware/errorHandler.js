function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(error, _req, res, _next) {
  if (res.headersSent) return;

  if (error.type === 'entity.parse.failed' || error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body.' });
  }

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    const details = error.name === 'ValidationError'
      ? Object.values(error.errors || {}).map((item) => item.message)
      : [error.message];
    return res.status(400).json({ success: false, message: 'Validation failed.', details });
  }

  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: 'A record with this unique value already exists.' });
  }

  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const message = statusCode >= 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected server error occurred.'
    : (error.message || 'An unexpected server error occurred.');

  if (statusCode >= 500) {
    console.error(`[API error] ${error.message}`);
  }

  return res.status(statusCode).json({ success: false, message });
}

module.exports = { notFoundHandler, errorHandler };
