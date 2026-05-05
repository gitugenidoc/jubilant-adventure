# 🏥 GeniDoc Hayat - Digital Healthcare Platform

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: January 2026

---

## 📋 Overview

GeniDoc Hayat is a comprehensive, production-ready digital healthcare platform built with **Node.js**, **Express**, **React**, and **PostgreSQL**. It provides complete patient management, electronic health records (DPI), shared medical records (DMP), consent management, and advanced audit/security features.

### Key Features

- 🔐 **Enterprise Security**: JWT authentication, MFA, RBAC, audit logging
- 👥 **Patient Management**: Search, create, view, edit patient records
- 📋 **Electronic Health Records**: Encounters, diagnoses, procedures, observations
- 📄 **Shared Medical Records**: Publish, share, grant/revoke access
- ✓ **Consent Management**: Create, track, revoke patient consents
- 📊 **Audit & Compliance**: Complete audit trail, security events, compliance reports
- 🎨 **Responsive UI**: Mobile-friendly, intuitive interface
- 🐳 **Docker Ready**: Production-grade containerization

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- npm or yarn

### Installation (5 minutes)

```bash
# 1. Clone repository
git clone <repo-url>
cd genidocthisistheversion

# 2. Backend setup
cd backend
npm install
cp .env.example .env  # Configure database
npx prisma migrate dev
npm run dev

# 3. Frontend setup (new terminal)
cd frontend
npm install
npm run dev

# 4. Open browser
# Frontend: http://localhost:5173
# Backend: http://localhost:3000/api
```

**Demo Login:**

- Email: `doctor@genidoc.ma`
- Password: `Doctor@123456`

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

---

## 📁 Project Structure

```
genidocthisistheversion/
├── backend/                    # Node.js/Express server
│   ├── src/
│   │   ├── config/            # Database & environment config
│   │   ├── lib/               # Business logic (services)
│   │   ├── middleware/        # Auth, error handling, audit
│   │   ├── routes/            # API endpoints (72+)
│   │   └── server.js          # Main entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   ├── .env                   # Environment variables
│   └── package.json
│
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components (10+ pages)
│   │   ├── App.jsx            # Router & routing
│   │   └── main.jsx           # Entry point
│   ├── .env                   # Environment variables
│   └── package.json
│
├── docs/                      # Documentation
│   ├── SETUP_GUIDE.md        # Installation & configuration
│   ├── API_DOCUMENTATION.md  # Complete API reference
│   └── FEATURES_COMPLETE.md  # All implemented features
│
├── docker-compose.yml        # Docker orchestration
└── README.md                 # This file
```

---

## 🔗 API Endpoints (72+)

### Total: 72+ fully implemented endpoints across 8 modules

- Authentication (8)
- Patient Management (11)
- DPI - Electronic Health Records (11)
- DMP - Shared Medical Records (8)
- Consent Management (9)
- Audit & Security (6)
- Digital Card (6)
- FHIR Healthcare Exchange (12)

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete reference.

---

## 🎯 Core Features

### 1. Authentication & Security

- ✅ User registration & login
- ✅ JWT tokens (15 min) + Refresh tokens (30 days)
- ✅ MFA with TOTP (Google Authenticator)
- ✅ Role-based access control (Admin, Doctor, Patient)
- ✅ Permission-based authorization
- ✅ Secure password hashing (bcrypt)

### 2. Patient Management

- ✅ Create, search, view, edit patients
- ✅ Patient identifiers (local, national, insurance, passport)
- ✅ Emergency contacts
- ✅ Duplicate detection & merge
- ✅ Patient timeline (clinical history)

### 3. DPI (Electronic Health Record)

- ✅ Encounters (consultation, hospitalization, follow-up)
- ✅ SOAP notes, Diagnoses, Procedures, Observations
- ✅ Vital signs and lab results
- ✅ Document upload and management
- ✅ Publish to DMP

### 4. DMP (Shared Medical Record)

- ✅ Publish documents from DPI
- ✅ Grant/revoke access to users
- ✅ Access history logging
- ✅ Document sharing with expiration

### 5. Consent Management

- ✅ Create consents for research, treatment, marketing
- ✅ Consent validity verification
- ✅ Revocation with reasons
- ✅ Consent history tracking

### 6. Audit & Compliance

- ✅ Complete audit trail
- ✅ Security event tracking
- ✅ Break-glass emergency access logging
- ✅ Data access reports
- ✅ Compliance reporting

---

## 🖥️ Frontend Pages

- Landing Page (hero, features, testimonials)
- Login Page (email/password, MFA, register)
- Dashboard (stats, quick actions)
- Patient List (search with pagination)
- Patient Create (form with validation)
- Patient Detail (4 tabs: info, identifiants, contacts, historique)
- DPI Viewer (encounters, documents, diagnoses)
- DMP Viewer (publications, access management)
- Consent Manager (create, revoke, history)
- Audit Logs (admin-only, filterable)

---

## 🛡️ Security Features

- JWT authentication with refresh tokens
- Multi-Factor Authentication (TOTP)
- Role-Based Access Control
- Permission-based authorization
- Complete audit logging
- Break-glass emergency access
- Consent verification
- Data access reports
- Compliance reports

---

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

Services:

- Frontend (5173)
- Backend (3000)
- PostgreSQL (5432)

---

## 📚 Documentation

| Document                                       | Purpose                                      |
| ---------------------------------------------- | -------------------------------------------- |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md)             | Installation, configuration, troubleshooting |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete API reference, examples             |
| [FEATURES_COMPLETE.md](./FEATURES_COMPLETE.md) | All implemented features, checklist          |

---

## 💻 Technology Stack

**Backend**: Node.js, Express, PostgreSQL, Prisma  
**Frontend**: React, Vite, Tailwind CSS, React Router  
**Infrastructure**: Docker, Docker Compose

---

## ✨ Key Achievements

✅ 72+ API endpoints  
✅ 10+ frontend pages  
✅ Enterprise security  
✅ Comprehensive audit logging  
✅ Production-ready code  
✅ Full documentation  
✅ Docker support  
✅ HIPAA-aligned design

---

## 🚀 Get Started Now

```bash
cd backend && npm run dev   # Terminal 1
cd frontend && npm run dev  # Terminal 2
# Open http://localhost:5173
# Login: doctor@genidoc.ma / Doctor@123456
```

---

**Status**: ✅ **FULLY FUNCTIONAL AND PRODUCTION READY**

For detailed instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)
├── package.json # Dépendances du projet
├── vite.config.js # Configuration Vite
├── tailwind.config.js # Configuration Tailwind CSS
└── postcss.config.js # Configuration PostCSS

````

## 🎨 Technologies utilisées

- **React 18** - Framework UI
- **Vite** - Build tool et dev server
- **Tailwind CSS** - Framework CSS utilitaire
- **Material Symbols** - Icônes

## 🔧 Configuration

### Tailwind CSS

Les couleurs personnalisées et les espacements sont définis dans `tailwind.config.js` pour correspondre à la palette de design original.

### Vite

- Port de développement : 5173
- Configuration du build optimisée

## 📱 Responsive Design

Tous les composants sont responsive et adaptés pour :

- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

## 🔄 Conversion HTML → React

Les sections suivantes ont été converties en composants React réutilisables :

- ✅ TopNavBar - Navigation principale
- ✅ HeroSection - Section héros avec CTA
- ✅ ProblemSolution - Problème/Solution
- ✅ HowItWorks - 3 étapes
- ✅ Stats - Statistiques
- ✅ Certifications - Badges de certifications
- ✅ SecurityCompliance - Conformité et sécurité
- ✅ Testimonials - Témoignages avec étoiles
- ✅ FAQ - Questions/réponses interactif
- ✅ FinalCTA - Appel à l'action final
- ✅ Benefits - Avantages par acteur
- ✅ Features - Fonctionnalités clés
- ✅ Footer - Pied de page

## ✨ Améliorations React

- **État interactif** : FAQ avec gestion d'état
- **Composants modulaires** : Facile à maintenir et réutiliser
- **Props dynamiques** : Les données sont externalisées
- **Optimisation** : Rendu conditionnel et listes optimisées

## 🚀 Déploiement

Pour déployer en production :

```bash
npm run build
````

Cela crée un dossier `dist/` prêt pour le déploiement sur Netlify, Vercel, ou tout autre serveur statique.

## 📝 Notes

- Les images externes sont héritées du HTML original
- Les styles Material Symbols sont chargés via CDN
- Les fonts (Sora, Inter) sont chargées via Google Fonts

## 📞 Support

Pour toute question, consulter la documentation Vite et React.
