# Installation & Development Guide

## Prérequis

- **Node.js**: 18+
- **Docker**: 20+ avec Docker Compose
- **PostgreSQL**: 16 (ou via Docker)
- **Git**: Pour cloner le repo

## Installation Rapide

### Option 1: Docker Compose (Recommandé - Local)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/genidoc-hospital-platform.git
cd genidoc-hospital-platform

# 2. Démarrer l'infrastructure
docker-compose up -d

# 3. Attendre que tout soit prêt (30-60 sec)
docker ps

# 4. Vérifier la connexion DB
curl http://localhost:3000/api/health

# 5. Dashboard DB (optionnel)
# http://localhost:8080
# Login: genidoc / genidoc123
```

**Accès aux services:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Database Admin: http://localhost:8080
- Redis: localhost:6379

### Option 2: Installation Manuelle

#### Backend

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Setup .env
cp .env.example .env
# Edit .env with your database credentials

# 3. Database setup
npx prisma migrate dev --name init

# 4. Seed demo data
npm run seed

# 5. Start dev server
npm run dev
# Server running on http://localhost:3000
```

#### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Setup .env
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:3000/api

# 3. Start dev server
npm run dev
# App running on http://localhost:5173
```

## Démonstration

### Données de Seed

Après `npm run seed` ou `docker-compose up -d`:

**Utilisateurs de démo:**

```
Admin:
  Email: admin@genidoc.ma
  Password: Admin@123456
  Role: Administrator
  Permissions: All

Doctor:
  Email: doctor@genidoc.ma
  Password: Doctor@123456
  Role: Medical Doctor
  Permissions: Patients read/write, DPI, Prescribe, Sign

Nurse:
  Email: nurse@genidoc.ma
  Password: Nurse@123456
  Role: Nurse
  Permissions: Patients read, DPI read/write
```

**Patients de démo:**

- Mohammed Hassan (HCK-20240505-00001)
- Aïcha Moudni (HCK-20240505-00002)
- Khalid Idrissi (HUM6-20240505-00001)

### Premier Test

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@genidoc.ma",
    "password": "Doctor@123456"
  }'

# Response: accessToken, refreshToken, user info

# 2. Search patients
curl -X GET "http://localhost:3000/api/patients/search?q=mohammed" \
  -H "Authorization: Bearer <accessToken>"

# 3. Get patient details
curl -X GET "http://localhost:3000/api/patients/<patientId>" \
  -H "Authorization: Bearer <accessToken>"
```

## Développement

### Structure du Projet

```
genidoc-hospital-platform/
├── frontend/                 # React app
│   ├── src/
│   │   ├── pages/           # Route pages
│   │   ├── components/      # Reusable components
│   │   ├── lib/             # Utilities (API, auth)
│   │   ├── styles/          # CSS/Tailwind
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── server.js        # Entry point
│   │   ├── middleware/      # Auth, audit, errors
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helpers
│   │   └── config/          # Configuration
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── migrations/      # DB migrations
│   │   └── seed.js          # Demo data
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── SECURITY.md
│   ├── COMPLIANCE.md
│   └── DEVELOPMENT.md
│
├── docker-compose.yml       # Local dev infrastructure
├── README_HOSPITAL.md       # Main README
└── .github/
    └── workflows/           # CI/CD pipelines
```

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/patient-search

# 2. Make changes, commit
git add .
git commit -m "feat: implement patient search with filters"

# 3. Push to remote
git push origin feature/patient-search

# 4. Create Pull Request on GitHub
# → Automated tests run
# → Code review
# → Merge to main

# 5. Main branch auto-deploys to staging
# → Manual approval → Deploy to production
```

### Commit Message Convention

```
feat: new feature
fix: bug fix
docs: documentation
test: tests
refactor: code refactoring
chore: maintenance tasks
security: security-related changes
perf: performance improvements

Example: feat(auth): add MFA support for users
```

### Tests

```bash
# Backend
cd backend
npm test                    # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report

# Frontend
cd frontend
npm test                    # Run tests
npm run test:watch        # Watch mode
```

### Database Migrations

```bash
cd backend

# Create new migration
npx prisma migrate dev --name add_new_table

# See migration status
npx prisma migrate status

# Reset database (dev only!)
npx prisma migrate reset

# View database with UI
npx prisma studio
```

### API Development

**Adding a new endpoint:**

```javascript
// 1. Create/Update service (src/services/myService.js)
export const getMyData = async (id) => {
  return await prisma.myModel.findUnique({
    where: { id },
  });
};

// 2. Create route (src/routes/my.js)
import express from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authMiddleware, requirePermission } from "../middleware/auth.js";
import { getMyData } from "../services/myService.js";

const router = express.Router();

router.get(
  "/:id",
  authMiddleware,
  requirePermission("my:read"),
  asyncHandler(async (req, res) => {
    const data = await getMyData(req.params.id);
    res.json(data);
  }),
);

export default router;

// 3. Register route (src/server.js)
import myRoutes from "./routes/my.js";
app.use("/api/my", myRoutes);
```

### Frontend Development

**Adding a new component:**

```javascript
// src/components/MyComponent.jsx
export const MyComponent = ({ title, data }) => {
  return (
    <div className="p-4">
      <h2 className="font-bold">{title}</h2>
      {/* Component code */}
    </div>
  );
};

// Usage in page
import { MyComponent } from "../components/MyComponent";

export default function MyPage() {
  return <MyComponent title="My Title" data={myData} />;
}
```

### Environment Variables

**Backend (.env):**

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://genidoc:genidoc123@localhost:5432/genidoc_hospital
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env.local):**

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Debugging

### Backend

```bash
# With Node debugger
node inspect src/server.js

# With nodemon auto-restart
npm run dev

# Check logs
tail -f logs/genidoc.log

# View database
npx prisma studio
```

### Frontend

- Browser DevTools (F12)
- React DevTools extension
- Network tab to inspect API calls
- Console for logs

## Performance Optimization

### Database

```sql
-- Add indexes
CREATE INDEX idx_patients_org ON patients(organization_id);
CREATE INDEX idx_encounters_patient ON encounters(patient_id);

-- Query optimization
EXPLAIN ANALYZE SELECT * FROM patients WHERE organization_id = 'xxx';
```

### API Caching

- Use React Query for client-side caching
- Add Redis for server-side cache
- Cache patient list searches

### Frontend

- Code splitting with React.lazy()
- Image optimization
- CSS minification (Tailwind auto-purges)
- Tree-shaking of unused code

## Monitoring & Logs

### Backend Logs

```
logs/
├── genidoc.log          # Application logs
├── error.log            # Errors only
├── access.log           # HTTP access logs
└── security.log         # Security events
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Database Connections

```bash
# Check open connections
psql -d genidoc_hospital -c "SELECT count(*) FROM pg_stat_activity;"
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Or test manually
psql postgresql://genidoc:genidoc123@localhost:5432/genidoc_hospital
```

### JWT Token Expired

```bash
# Clear local storage in browser
localStorage.removeItem('accessToken')
localStorage.removeItem('refreshToken')

# Re-login
```

### Migration Issues

```bash
# Reset database (dev only)
npx prisma migrate reset --force

# Re-seed data
npm run seed
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/description`
3. Commit changes: `git commit -m "feat: description"`
4. Push to branch: `git push origin feature/description`
5. Open Pull Request

**Code standards:**

- ESLint configured
- Prettier for formatting
- Jest for testing
- Conventional Commits

## Resources

- [Node.js Docs](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com)
- [Prisma ORM](https://www.prisma.io/docs)
- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [FHIR R4](https://www.hl7.org/fhir/R4)

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: /docs folder
- **Email**: team@genidoc.ma

---

**Version**: 1.0 Phase 1  
**Last Updated**: Mai 2026
