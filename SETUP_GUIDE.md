# GeniDoc Hayat - Setup & Installation Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 20 LTS
- PostgreSQL 16
- npm or yarn

---

## 1. Backend Setup

### 1.1 Install Dependencies

```bash
cd backend
npm install
```

### 1.2 Environment Configuration

Create `.env` file in `backend/` directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/genidoc

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=900 # 15 minutes
REFRESH_TOKEN_EXPIRY=2592000 # 30 days

# MFA
MFA_WINDOW=2

# CORS
CORS_ORIGIN=http://localhost:5173

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379
```

### 1.3 Database Setup

```bash
# Create database
createdb genidoc

# Run migrations
cd backend
npx prisma migrate dev --name initial

# Seed demo data
npm run seed
```

### 1.4 Start Backend Server

```bash
cd backend
npm run dev
# Server runs on http://localhost:3000
```

---

## 2. Frontend Setup

### 2.1 Install Dependencies

```bash
cd frontend
npm install
```

### 2.2 Environment Configuration

Create `.env` file in `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2.3 Start Frontend Development Server

```bash
cd frontend
npm run dev
# Application runs on http://localhost:5173
```

---

## 3. Docker Setup (Optional)

### 3.1 Build Docker Images

```bash
# Backend
docker build -t genidoc-backend ./backend

# Frontend
docker build -t genidoc-frontend ./frontend
```

### 3.2 Run with Docker Compose

```bash
docker-compose up -d
```

Access:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Database: localhost:5432

---

## 4. Verify Installation

### 4.1 Backend Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 123.45,
  "version": "1.0.0"
}
```

### 4.2 Frontend Access

Open browser: http://localhost:5173

You should see the GeniDoc Hayat landing page.

### 4.3 Test Login

Use demo credentials:

- **Email:** doctor@genidoc.ma
- **Password:** Doctor@123456

---

## 5. Feature Checklist

### ✅ Authentication

- [ ] Registration works
- [ ] Login with email/password works
- [ ] MFA setup and verification works
- [ ] Token refresh works
- [ ] Logout clears tokens

### ✅ Patient Management

- [ ] Search patients works
- [ ] Create new patient works
- [ ] View patient details works
- [ ] Edit patient information works
- [ ] Patient list shows recent patients

### ✅ DPI (Electronic Health Record)

- [ ] View encounters
- [ ] Create new encounter
- [ ] Add diagnoses
- [ ] Record vital signs
- [ ] Upload documents
- [ ] Publish to DMP

### ✅ DMP (Shared Medical Record)

- [ ] View publications
- [ ] Grant access to users
- [ ] Revoke access
- [ ] View access history
- [ ] Share documents

### ✅ Consent Management

- [ ] Create consents
- [ ] View active consents
- [ ] Revoke consents
- [ ] View consent history
- [ ] Verify consent validity

### ✅ Audit & Security

- [ ] View audit logs
- [ ] Filter logs by action/resource
- [ ] View security events
- [ ] View break-glass (emergency access) logs
- [ ] Generate compliance reports

---

## 6. Project Structure

```
genidocthisistheversion/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── lib/             # Business logic services
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Additional services
│   │   └── server.js        # Main server file
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   ├── .env                 # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── App.jsx          # Main app with routing
│   │   └── main.jsx         # Entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
└── docker-compose.yml       # Docker composition
```

---

## 7. Common Commands

### Backend

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production
npm start

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Seed database
npm run seed

# View database
npx prisma studio
```

### Frontend

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 8. Testing

### API Testing with curl

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@genidoc.ma","password":"Doctor@123456"}'
```

#### Search Patients

```bash
curl http://localhost:3000/api/patients/search?q=mohammed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create Patient

```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "firstname":"Mohammed",
    "lastname":"Hassan",
    "email":"patient@example.com",
    "phone":"+212612345678",
    "dateOfBirth":"1990-01-15"
  }'
```

### Using Postman

A Postman collection is available at: `docs/postman-collection.json`

Import into Postman and use the provided endpoints.

---

## 9. Troubleshooting

### Backend Won't Start

1. Check if port 3000 is available
2. Verify DATABASE_URL in .env
3. Run migrations: `npx prisma migrate dev`
4. Check logs for specific errors

### Frontend Won't Connect to Backend

1. Check VITE_API_BASE_URL in frontend .env
2. Verify backend is running on port 3000
3. Check CORS settings in backend .env
4. Clear browser cache and local storage

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Verify connection string in .env
3. Check database permissions
4. Run `npx prisma db push` to sync schema

### MFA Issues

1. Check system time (must be in sync for TOTP)
2. Use a TOTP app like Google Authenticator
3. Verify MFA_WINDOW setting in .env

---

## 10. Production Deployment

### 1. Environment Setup

```env
NODE_ENV=production
JWT_SECRET=<generate-strong-random-key>
DATABASE_URL=<production-database-url>
CORS_ORIGIN=https://yourdomain.com
```

### 2. Build Applications

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### 3. Database Migrations

```bash
cd backend
npx prisma migrate deploy
```

### 4. Start Services

```bash
# Backend (use PM2 or similar)
pm2 start npm --name "genidoc-backend" -- start

# Frontend (use nginx or similar)
# Serve frontend/dist with web server
```

### 5. SSL/HTTPS

- Set up SSL certificates (Let's Encrypt recommended)
- Configure reverse proxy (nginx recommended)
- Update CORS_ORIGIN to use https

### 6. Monitoring

- Set up application monitoring (New Relic, Datadog)
- Configure error tracking (Sentry)
- Set up logging aggregation (ELK Stack)
- Monitor database performance

---

## 11. Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)

---

## 12. Support & Issues

For issues or questions:

1. Check logs: `docker-compose logs -f`
2. Review error messages in browser console
3. Check database with: `npx prisma studio`
4. Review API responses in network tab
