"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncAuthHandler = exports.asyncHandler = void 0;
// Async handler wrapper for regular requests
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
// Async handler wrapper for authenticated requests
const asyncAuthHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncAuthHandler = asyncAuthHandler;
//# sourceMappingURL=asyncHandler.js.map