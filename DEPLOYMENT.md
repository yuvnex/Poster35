# Poster35 — Production Hosting Guide (Render & Vercel)

This repository contains clean, production-ready code for the **Poster35** online poster ordering platform (Fixed ₹35 per poster). All test orders have been completely wiped, exposed credentials have been removed, and the build is verified.

---

## Current Store Status
- **Orders in Database**: **0** (Clean slate for real customers)
- **Catalog**: **216 Real Posters** across 9 categories (CR7, Dhoni, English Movies, Messi, Music Poster, Neymar, Tamil Movies, Vijay, Virat Kohli)
- **Pricing**: Fixed **₹35** per poster
- **Delivery**: **100% Free Shipping** (`₹0`)
- **Checkout Mode**: Direct Order / Cash on Delivery (no online payment gateway mandatory)

---

## Option 1: 1-Click Unified Hosting on Render (Recommended — Simplest & Free)

With this option, Render runs both the **React Frontend** and the **Express Backend** together on a single web service.
- **Cost**: 100% Free Tier on Render
- **Single URL**: e.g., `https://poster35-store.onrender.com`
- **Zero CORS issues**: Frontend and API live on the exact same domain.

### Steps to Deploy on Render:
1. Push this project to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Poster35 ready for production hosting"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Blueprint** (or **Web Service**).
3. Connect your GitHub repository.
4. Render will automatically detect [`render.yaml`](./render.yaml) with these settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Region**: Choose closest to your audience (e.g., `Singapore` or `Frankfurt`)
5. Click **Apply / Create Web Service**.
6. Render will automatically build the React Vite bundle, start the Express server, and provide your live HTTPS URL!

---

## Option 2: Split Hosting (Frontend on Vercel + Backend on Render)

If you prefer to host your frontend on **Vercel** and your backend on **Render**:

### Step 1: Deploy Backend to Render
1. In [Render Dashboard](https://dashboard.render.com/), click **New +** → **Web Service**.
2. Connect your GitHub repo.
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node --experimental-strip-types src/server.ts`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
     - `JWT_SECRET`: *(Click 'Generate' on Render or enter any random secret string)*
4. Once deployed, copy your Render backend URL (e.g., `https://poster35-backend.onrender.com`).

### Step 2: Deploy Frontend to Vercel
1. In [Vercel Dashboard](https://vercel.com/new), click **Add New...** → **Project** and select your GitHub repo.
2. If prompted for **Root Directory**, leave as root (or choose `frontend`).
3. In [`vercel.json`](./vercel.json), replace `YOUR-BACKEND-RENDER-URL.onrender.com` with your actual Render URL from Step 1:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://poster35-backend.onrender.com/api/$1"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
4. Click **Deploy**. Vercel will build the frontend with instant global CDN distribution.

---

## Useful Maintenance Commands

- **Reset / Clear all test orders anytime**:
  ```bash
  npm run clear:orders
  ```
- **Re-seed catalog from poster folders**:
  ```bash
  npm run seed
  ```
- **Run local development**:
  ```bash
  npm run dev
  ```
- **Run verification test suite**:
  ```bash
  node scripts/verify-all.js
  ```
