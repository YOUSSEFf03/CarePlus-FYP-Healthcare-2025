# FYP Healthcare 2025 - Monorepo Guide

Welcome to the FYP Healthcare 2025 platform! This project uses a **monorepo** structure to manage all frontend, backend, and mobile apps in a single, unified codebase. This README will guide you on how to work with the project effectively.

---

## 📁 Project Structure

```
/FYP-Healthcare-2025
├── Apps/
│   ├── web/                     # React (TypeScript) Web App
│   ├── mobile/                  # React Native App (optional)
│   └── backend/
│       └── apps/
│           ├── auth/           # NestJS Auth Microservice
│           └── gateway/        # NestJS API Gateway
├── node_modules/               # Root-level dependencies ONLY
├── package.json                # Workspace and script definitions
├── turbo.json                  # Turborepo configuration
├── .gitignore                  # Global ignore rules
└── README.md                   # This file
```

---

## 🚫 DO NOT Install Dependencies Inside Individual App Folders

**All dependencies must be installed from the root folder (`FYP Healthcare 2025`).**
This ensures consistency and enables Turborepo to work correctly.

### ✅ Correct Example (installing `axios` for `web` app):

```bash
npm install axios -w Apps/web
```

### ❌ Incorrect:

```bash
cd Apps/web
npm install axios   # ❌ DO NOT DO THIS
```

### ✅ Install for multiple workspaces:

```bash
npm install lodash -w Apps/web -w Apps/backend/apps/auth
```

---

## 🚫 DO NOT Create Local `node_modules` Folders

There should be **only one `node_modules` folder** in the root.
If you accidentally run `npm install` inside a subfolder, delete:

```bash
rm -rf Apps/web/node_modules
rm -rf Apps/backend/apps/auth/node_modules
```

Then reinstall from the root:

```bash
npm install
```

---

## 🚀 Available Scripts (Run from Root)

### ▶️ Run Only Web App

```bash
npm run start:web
```

### ▶️ Run Only Mobile App

```bash
npm run start:mobile
```

### ▶️ Run Only Auth Service

```bash
npm run start:auth
```

### ▶️ Run Only Gateway Service

```bash
npm run start:gateway
```

### ▶️ Same for all other services

```bash
npm run start:your-service
```

* but to have this you should add in pacakge.json in root folder the script like these:
"start:auth": "npm start --workspace=Apps/backend/apps/auth",
"start:gateway": "npm start --workspace=Apps/backend/apps/gateway"

but you:

"start:your-service": "npm start --workspace=Apps/backend/apps/your-service",

---

### ▶️ Run Everything (all services and frontend)

```bash
npm run start:all
```

> Uses Turborepo to run `start` in every workspace.

### ▶️ Build Everything

```bash
npm run build:all
```

---

## 🧠 Tips for Working in the Monorepo

* Use `npm install your-library-name -w <workspace>` replace <workspace> with for example Apps/web to install anything.
* Never run `npm install` inside app folders.
* Use `turbo run start` or filtered commands for advanced workflows.
* Each workspace should have its own `start` and `build` scripts.
* `.env` files should be managed per app and ignored in Git.

---