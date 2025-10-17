"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.prismaMiddleware = void 0;
const prisma_1 = require("../lib/prisma");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return prisma_1.prisma; } });
const prismaMiddleware = (req, res, next) => {
    req.prisma = prisma_1.prisma;
    next();
};
exports.prismaMiddleware = prismaMiddleware;
//# sourceMappingURL=prisma.js.map