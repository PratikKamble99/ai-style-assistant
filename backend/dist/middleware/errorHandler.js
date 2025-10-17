"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    // Log error for debugging
    console.error(`Error ${statusCode}: ${message}`);
    console.error(err.stack);
    // Don't leak error details in production
    const response = {
        error: process.env.NODE_ENV === 'production'
            ? (statusCode === 500 ? 'Internal Server Error' : message)
            : message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    };
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map