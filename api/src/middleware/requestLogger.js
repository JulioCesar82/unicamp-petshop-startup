const logger = require('../config/logger');

// Middleware to log request metadata and response time
module.exports = function requestLogger(req, res, next) {
  const start = process.hrtime();
  const timestamp = new Date().toISOString();

  // When response finishes, compute duration and log the metadata
  res.on('finish', () => {
    const [sec, nano] = process.hrtime(start);
    const durationMs = (sec * 1e3 + nano / 1e6).toFixed(3);

    const log = {
      timestamp,
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || (req.connection && req.connection.remoteAddress),
      status: res.statusCode,
      durationMs: Number(durationMs)
    };

    // Use structured logging
    logger.info(log);
    console.log(log);
  });

  next();
};
