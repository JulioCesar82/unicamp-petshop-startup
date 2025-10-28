const { statusCodes } = require('../config/general');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || statusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    statusCode: statusCode
  });
};

module.exports = errorHandler;
