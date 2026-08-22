# Deployment Guide (Low-Cost, First-Time Friendly)

Recommended stack for a 10-room homestay on a tight budget: total ongoing cost can be **$0/month**
aside from the domain (~$10–15/year), using free tiers.

| Piece | Recommended service | Why |
|---|---|---|
| Frontend | Vercel or Netlify | Free tier, automatic HTTPS, git-based deploys |
| Backend | Railway or Render | Free/hobby tier, runs a Spring Boot JAR, automatic HTTPS |
| Database | Railway MySQL or Aiven free MySQL | Managed MySQL, no server admin needed |
| Payments | Razorpay | See `docs/PAYMENT_SETUP.md` |
| Domain | Any registrar (Namecheap, GoDaddy, Google Domains successor) | ~$10–15/year |

This guide uses **Railway** for both backend and database since it keeps things in one place,
which is easier the first time you deploy. Render is a fine alternative — the steps are similar.

---

## Step 1 — Push your code to GitHub

```powershell
cd homestay-project
git add .
git commit -m "Initial commit"
```

Create a new repository on GitHub, then:

```powershell
git remote add origin https://github.com/your-username/homestay-project.git
git branch -M main
git push -u origin main
```

**Never commit real secrets** — check `.gitignore` is doing its job (`.env` files, `uploads/`,
`target/`, `node_modules/` should never appear in `git status`).

## Step 2 — Production MySQL Database

1. Sign up at **railway.app**.
2. New Project → **Provision MySQL**.
3. Once created, click the MySQL service → **Connect** tab. Note down:
   - Host, Port, Database name, Username, Password (Railway shows a full connection string too)
4. Import your schema: use the `mysql` CLI pointed at Railway's connection details, or run
   the schema.sql through a GUI tool like MySQL Workbench / DBeaver / TablePlus connected to
   the Railway database.
   ```powershell
   mysql -h <railway-host> -P <port> -u <user> -p<password> <database> < docs/schema.sql
   ```
5. **SSL:** Railway's MySQL requires SSL by default for external connections — when you set
   `DB_URL` in Step 3, include `?useSSL=true&requireSSL=true` instead of `useSSL=false`.
6. **Backups:** Railway takes automatic backups on paid plans; on the free tier, periodically
   export manually: `mysqldump -h <host> -P <port> -u <user> -p<password> <database> > backup.sql`

## Step 3 — Deploy the Backend

1. In the same Railway project, **New Service** → **Deploy from GitHub repo** → select your repo,
   set the **root directory** to `backend`.
2. Railway auto-detects Java/Maven and builds it. If it doesn't, add a `railway.toml` or set the
   build command to `mvn clean package -DskipTests` and start command to
   `java -jar target/backend-1.0.0.jar`.
3. Set environment variables (Railway → your backend service → **Variables**):
   ```
   DB_URL=jdbc:mysql://<railway-mysql-host>:<port>/<database>?useSSL=true&requireSSL=true&serverTimezone=UTC
   DB_USERNAME=<from step 2>
   DB_PASSWORD=<from step 2>
   JWT_SECRET=<generate: openssl rand -base64 48>
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=<pick a strong password>
   ```
4. Deploy. Railway gives you a public URL like `https://homestay-backend-production.up.railway.app`
   — this is your `VITE_API_BASE_URL` for the frontend (append `/api`).
5. **Test:** visit `https://your-backend-url/api/homestay` — should return JSON (or 404 if you
   haven't added homestay data yet, which still confirms the backend is up).

## Step 4 — Deploy the Frontend

1. Sign up at **vercel.com**, connect your GitHub repo.
2. New Project → select your repo → set **root directory** to `frontend`.
3. Vercel auto-detects Vite. Framework preset: "Vite".
4. Set environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend-url/api
   VITE_HOMESTAY_NAME=Your Homestay Name
   VITE_WHATSAPP_NUMBER=91XXXXXXXXXX
   ```
5. Deploy. Vercel gives you a URL like `https://homestay-frontend.vercel.app`.
6. Go back to your **backend's** `CORS_ALLOWED_ORIGINS` env var and update it to this exact
   Vercel URL (and later your custom domain too, comma-separated) — then redeploy the backend.

## Step 5 — Images (No Cloud Storage Needed)

Photos are static frontend files now, not an upload system — put them in
`frontend/public/images/` and they deploy automatically as part of the frontend build (Step 4).
There is no `FileStorageService`, no `/uploads/**` folder, and nothing to configure here. If
you're wondering where the old image-upload backend went, see `docs/SIMPLIFICATION_GUIDE.md`.

## Step 6 — Domain & HTTPS

1. Buy a domain from any registrar.
2. In Vercel: **Project Settings → Domains** → add your domain → Vercel gives you DNS records
   (usually an `A` record or `CNAME`) to add at your registrar.
3. In your registrar's DNS settings, add those records. Propagation can take a few hours.
4. Vercel automatically provisions HTTPS (via Let's Encrypt) once DNS is verified — no manual
   certificate work needed.
5. Update `CORS_ALLOWED_ORIGINS` on the backend to include your final custom domain.
6. Update the placeholder URLs in `SEO.jsx`, `index.html`, `robots.txt`, `sitemap.xml` (see
   `docs/SEO_AND_GOOGLE.md`) to match your real domain.

## Troubleshooting

- **CORS errors in browser console:** double-check `CORS_ALLOWED_ORIGINS` on the backend exactly
  matches your frontend's URL (including `https://`, no trailing slash).
- **Backend can't connect to MySQL:** check SSL params in `DB_URL`, and that Railway's MySQL
  service is in the "Running" state.
- **Images disappear after redeploy:** you're still using local disk storage on an ephemeral
  host — switch to Cloudinary (Step 5).
- **401 errors on all admin requests:** JWT token expired (default 24h) — just log in again.
