function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}

module.exports = { errorHandler };
