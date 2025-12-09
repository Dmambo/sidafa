# Deployment Guide for Sidafa Sano Family Legacy

This guide covers deploying both the frontend (Netlify) and backend (Railway/Render) separately.

## Prerequisites

- GitHub account
- Netlify account (free tier works)
- Railway or Render account (for backend)
- PostgreSQL database (Neon, Supabase, Railway, or Render)

## Part 1: Deploy Backend (Express Server)

### Option A: Deploy on Render (Recommended for Same Repo)

Since your backend and frontend are in the same repository, Render makes it easy to deploy them separately:

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `sanola` repository

3. **Configure Backend Service:**
   - **Name:** `sanola-backend`
   - **Environment:** `Node`
   - **Root Directory:** Leave empty (or `/` if required)
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `npm run start`
   - **Instance Type:** Free (or choose a paid plan)

4. **Add PostgreSQL Database (or use your existing Neon database):**
   - If using Render's PostgreSQL: Create "New PostgreSQL" database
   - If using Neon (your current database): Skip this step

5. **Set Environment Variables:**
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = Your Neon database URL (from your `.env` file)
     ```
     postgresql://neondb_owner:npg_jmkgAPM9v1SY@ep-silent-bonus-a47a23op-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
     ```
   - `PORT` = `10000` (Render's default, or leave auto-assigned)
   - `FRONTEND_URL` = (Set this after deploying frontend - your Netlify URL)

6. **Deploy:** Click "Create Web Service"

7. **Get your backend URL:** Render will provide a URL like `https://sanola-backend.onrender.com`

8. **Run Database Migrations:**
   - After first deployment, go to your service → "Shell"
   - Run: `npx prisma migrate deploy`
   - Or add it as a one-off command

**Note:** You can also use `render.yaml` (included in the repo) to configure both services at once. Just select "Apply render.yaml" when creating a new service.

### Option B: Deploy on Railway

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Create a new project** and select "Deploy from GitHub repo"

3. **Connect your repository** and select the `sanola` repository

4. **Add PostgreSQL Database:**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will create a PostgreSQL database automatically

5. **Set Environment Variables:**
   - Go to your service → Variables
   - Add: `DATABASE_URL` = (Railway will provide this automatically from the PostgreSQL service)
   - Add: `PORT` = `3001` (or Railway will auto-assign)

6. **Configure Build Settings:**
   - Root Directory: `/` (or leave empty)
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm run dev:server` (or create a production start script)

7. **Update package.json** to add a production start script:
   ```json
   "scripts": {
     "start": "node --loader tsx server/index.ts"
   }
   ```

8. **Deploy:** Railway will automatically deploy your backend

9. **Get your backend URL:** Railway will provide a URL like `https://your-app.railway.app`

### Option B: Deploy on Render

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service** → "Build and deploy from a Git repository"

3. **Connect your GitHub repository**

4. **Configure the service:**
   - Name: `sanola-backend`
   - Environment: `Node`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm run start` (you'll need to add this script)

5. **Add PostgreSQL Database:**
   - Create a new PostgreSQL database in Render
   - Copy the Internal Database URL

6. **Set Environment Variables:**
   - `DATABASE_URL` = (from PostgreSQL database)
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render's default)

7. **Deploy:** Render will build and deploy your backend

8. **Get your backend URL:** Render will provide a URL like `https://sanola-backend.onrender.com`

## Part 2: Deploy Frontend (Netlify)

1. **Push your code to GitHub** (if not already done)

2. **Create a Netlify account** at [netlify.com](https://netlify.com)

3. **Create a new site:**
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your `sanola` repository

4. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - These should auto-detect from `netlify.toml`

5. **Set Environment Variables:**
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://your-backend-url.railway.app/api` (or your Render URL)
     - Example: `https://sanola-backend.onrender.com/api`
     - **Important:** Use the full URL including `/api` path

6. **Deploy:** Click "Deploy site"

7. **Your site will be live** at `https://your-site-name.netlify.app`

## Part 3: Database Setup

### Run Prisma Migrations

After deploying the backend, you need to run migrations:

**On Railway:**
- Go to your service → Deployments → Click the latest deployment → View logs
- Or use Railway CLI: `railway run npx prisma migrate deploy`

**On Render:**
- Add a one-off command: `npx prisma migrate deploy`
- Or SSH into your instance and run it

### Seed Database (Optional)

If you have seed data:
```bash
railway run npm run seed
# or on Render, add as a one-off command
```

## Part 4: Update Backend for Production

You may need to update your server to handle CORS properly:

```typescript
// In server/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-site.netlify.app',
  credentials: true
}));
```

## Troubleshooting

### Frontend can't connect to backend
- Check that `VITE_API_URL` is set correctly in Netlify
- Ensure backend URL includes `/api` path
- Check CORS settings on backend

### Database connection errors
- Verify `DATABASE_URL` is set correctly
- Ensure migrations have run: `npx prisma migrate deploy`
- Check database is accessible from your hosting provider

### Build errors
- Ensure all dependencies are in `package.json`
- Check Node version matches (use Node 18+)
- Verify Prisma client is generated: `npx prisma generate`

## Quick Reference

**Backend URL Format:**
- Railway: `https://your-app.railway.app`
- Render: `https://your-app.onrender.com`

**Frontend Environment Variable:**
```
VITE_API_URL=https://your-backend-url/api
```

**Database Migrations:**
```bash
npx prisma migrate deploy
```

