const catchAsync = (fn) => {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (err) {
      
        const statusCode = err.statusCode || 500;
  
        res.status(statusCode).json({
          success: false,
          message: err.message || 'Internal Server Error',
          code: err.code || 'SERVER_ERROR',
        });
      }
    };
  };
  
  module.exports = catchAsync;