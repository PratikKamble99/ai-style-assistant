"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Create a single Prisma client instance
const prisma = globalThis.__prisma || new client_1.PrismaClient({
    log: ['error', 'warn'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});
exports.prisma = prisma;
// In development, store the client on the global object to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
    globalThis.__prisma = prisma;
}
// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=prisma.js.map