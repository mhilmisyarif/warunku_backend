const errorHandler = (err, req, res, next) => {
    console.error('ERROR STACK:', err.stack); // Log the error stack for debugging

    let statusCode = err.statusCode || 500; // Default to 500 if no status code is set
    let message = err.message || 'Internal Server Error';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        // Consolidate Mongoose validation messages
        const messages = Object.values(err.errors).map(val => val.message);
        message = `Validation Error: ${messages.join(', ')}`;
    }

    // Mongoose duplicate key error
    if (err.code && err.code === 11000) {
        statusCode = 400;
        // Extract field name from error message
        const field = Object.keys(err.keyValue);
        message = `Duplicate field value entered for ${field}. Please use another value.`;
    }

    // Mongoose CastError (e.g., invalid ObjectId)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = `Invalid ID format for resource: ${err.path} - ${err.value}`;
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
        // Include stack in development only for security reasons
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;