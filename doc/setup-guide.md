# Setup Guide: Firebase + Supabase

This guide explains how to configure Firebase authentication and Supabase Postgres for this project, including local environment variables, optional Docker setup, and a quick verification flow.

## 1. Firebase Configuration

You need a Firebase project. If you do not have one yet, create it in the [Firebase Console](https://console.firebase.google.com/).

### 1.1 Get the frontend Firebase Client SDK configuration

1. In the Firebase Console, go to your project.
2. Open **Project settings** (the gear icon).
3. Scroll down to **Your apps**.
4. Select your **Web app**. If you do not have one yet, click **Add app** → **Web**.
5. Find the `firebaseConfig` object and copy all values.

### 1.2 Get the backend Firebase Admin SDK credentials

1. In the Firebase Console, go to **Project settings** → **Service accounts**.
2. Click **Generate new private key** and download the JSON file.
3. Put this file at `backend/firebase-credentials.json`.

This file is already included in `.gitignore`, so it will not be committed.

### 1.3 Enable sign-in methods

1. In the Firebase Console, go to **Authentication** → **Sign-in method**.
2. Enable **Email/Password**.
3. Optionally enable **Google** and **GitHub** if you want to test social login.

### 1.4 Write environment variables

#### Frontend — create `frontend/.env.local`

```bash
cp frontend/.env.example frontend/.env.local
```

Fill in:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Get these values from Firebase Console → Project settings → Your apps → Web
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
# Set to true if Google/GitHub login is enabled
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
NEXT_PUBLIC_AUTH_GITHUB_ENABLED=false
```

#### Backend — create `backend/.env`

```bash
cp backend/.env.example backend/.env
```

Fill in:

```env
# Firebase Admin — choose one of the two methods:
# Method A: point to the JSON file path (recommended for local development)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
FIREBASE_SERVICE_ACCOUNT_JSON=
# Method B: paste the JSON content directly (suitable for Docker/deployment)
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"..."}
# FIREBASE_CREDENTIALS_PATH=
PROJECT_NAME=Micro SaaS Backend
API_V1_PREFIX=/api/v1
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

## 2. Supabase Configuration

You need a Supabase project. Create one in the [Supabase Dashboard](https://supabase.com/dashboard).

### 2.1 Get the connection string

1. In the Supabase Dashboard, go to your project.
2. Open **Settings** → **Database**.
3. Find **Connection string** and select **URI** mode.
4. Important: change the prefix to `postgresql+asyncpg://` instead of `postgresql://`.
5. Use port `6543` for pooler / transaction mode, or `5432` for a direct connection.

### 2.2 Write environment variables

Add this to `backend/.env`:

```env
# Format: postgresql+asyncpg://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
DATABASE_URL=postgresql+asyncpg://postgres.xxxxxxxxxxxx:YourPassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

> **Important:** The connection string prefix must be `postgresql+asyncpg://` because the backend uses the SQLAlchemy async driver. Supabase gives you `postgresql://` by default, so you must change it manually.

### 2.3 Run database migrations

After `DATABASE_URL` is configured, run the Alembic migration to create the `users` table:

```bash
cd backend
uv run alembic upgrade head
```

After it succeeds, you can see the `users` table in **Supabase Dashboard** → **Table Editor**.

## 3. Docker Environment (Optional)

If you use Docker for development, you also need to fill in the root `.env` file:

```bash
cp .env.example .env
```

`docker-compose.yml` will pass the root `.env` file to both services.

## 4. Verify That the Configuration Is Correct

After the setup is complete, use these commands to verify everything:

```bash
# 1. Start the backend (confirm Firebase + DB connection)
cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 2. Check the health endpoint
curl http://localhost:8000/api/v1/health

# Expected: {"status":"healthy","version":"0.1.0"}

# 3. Start the frontend
pnpm --dir frontend dev
```

1. Open <http://localhost:3000>.
2. Click **Get Started**.
3. Register a test account.
4. After successful registration, you will be redirected to `/dashboard` and see the user information card.
5. If `DATABASE_URL` is configured and Alembic has been run, the dashboard will display full user information such as `display_name` and `created_at`.
6. If `DATABASE_URL` is not configured, login still works and only the basic information from the token is shown. This is graceful degradation.
