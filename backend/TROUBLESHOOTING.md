# Backend Troubleshooting Guide

## 🚀 Quick Fix

Run this command to fix most common issues:

```bash
npm run fix
```

This will:
- Install dependencies
- Generate Prisma client
- Create .env file
- Update database schema
- Seed sample data
- Build TypeScript

## 🔧 Manual Fixes

### 1. Prisma Client Issues

**Error**: `Property 'photoAnalysis' does not exist on type 'PrismaClient'`

**Fix**:
```bash
npx prisma generate
```

### 2. Database Connection Issues

**Error**: Database connection failed

**Fix**:
1. Install PostgreSQL
2. Create database:
   ```bash
   createdb ai_stylist_db
   ```
3. Update `DATABASE_URL` in `.env`
4. Push schema:
   ```bash
   npx prisma db push
   ```

### 3. Environment Variables

**Error**: JWT_SECRET is not defined

**Fix**:
Create `.env` file with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ai_stylist_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3002
NODE_ENV=development
```

### 4. TypeScript Compilation

**Error**: TypeScript compilation errors

**Fix**:
```bash
npm run build
```

### 5. Missing Dependencies

**Error**: Module not found

**Fix**:
```bash
npm install
```

## 🧪 Testing

### Health Check
```bash
node test-health.js
```

### API Testing
```bash
# Start server
npm run dev

# Test health endpoint
curl http://localhost:3002/health

# Test with authentication (replace TOKEN)
curl -H "Authorization: Bearer TOKEN" http://localhost:3002/api/user/profile
```

## 📋 Common Issues

### Issue: Server won't start

**Symptoms**: 
- Port already in use
- Module not found errors
- Database connection errors

**Solutions**:
1. Check if port 3002 is free: `lsof -i :3002`
2. Kill existing process: `kill -9 PID`
3. Run fix script: `npm run fix`

### Issue: Database errors

**Symptoms**:
- Connection refused
- Table doesn't exist
- Migration errors

**Solutions**:
1. Start PostgreSQL service
2. Create database: `createdb ai_stylist_db`
3. Run migrations: `npx prisma db push`
4. Seed data: `npm run seed`

### Issue: Authentication errors

**Symptoms**:
- JWT errors
- User not found
- Token invalid

**Solutions**:
1. Check JWT_SECRET in .env
2. Register a new user via `/api/auth/register`
3. Use valid token from login response

## 🔍 Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

Or specific modules:
```bash
DEBUG=prisma:* npm run dev
```

## 📊 API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Protected Endpoints (require Authorization header)
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/photos` - Upload photos
- `POST /api/ai/analyze-photos` - Analyze photos
- `POST /api/ai/suggestions` - Generate suggestions
- `GET /api/trends` - Get seasonal trends
- `GET /api/dashboard/overview` - Dashboard data

## 🛠️ Development Workflow

1. **Setup**:
   ```bash
   npm run fix
   ```

2. **Development**:
   ```bash
   npm run dev
   ```

3. **Testing**:
   ```bash
   node test-health.js
   ```

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

## 📞 Getting Help

If issues persist:

1. Check the console output for specific error messages
2. Verify all environment variables are set
3. Ensure PostgreSQL is running
4. Check that all dependencies are installed
5. Try running `npm run fix` again

## 🔄 Reset Everything

To start fresh:

```bash
# Reset database
npm run db:reset

# Clean install
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate

# Rebuild
npm run build
```