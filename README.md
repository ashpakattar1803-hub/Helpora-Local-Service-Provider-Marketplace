# Helpora - Local Service Provider Marketplace

Helpora is a web-based marketplace connecting customers with local service providers.

## Features
- Customer and provider registration and login
- Service discovery and category browsing
- Service requests and booking management
- Provider profile creation and approval workflow
- Customer and provider dashboards
- Admin dashboard and management tools
- Notifications and reviews

## Technology Stack
- Frontend: React, Vite, React Router, Tailwind CSS, Lucide React
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs

## Setup

### Backend
1. Open the backend folder.
2. Run npm install.
3. Create backend/.env with PORT, MONGODB_URI, JWT_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD.
4. Start the backend using npm run dev.

Backend URL: http://localhost:5000
Health check: http://localhost:5000/api/health

### Frontend
1. Open another terminal in the frontend folder.
2. Run npm install.
3. Run npm run dev.
4. Open the local URL displayed by Vite.

The frontend currently connects to the backend at http://localhost:5000.

## Production Build
From the frontend folder, run npm run build.

## Security
Never commit .env files, passwords, database credentials or JWT secrets.
Use your own secure environment variable values.
