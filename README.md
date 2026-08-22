# Homestay Website — Full Stack Project

React frontend + Spring Boot backend + MySQL, with online payments (Razorpay), dynamic
weekday/weekend/extra-guest pricing, and an admin panel scoped to bookings/availability/pricing
only. Static content (photos, room descriptions, facilities, nearby places, contact info) lives
in frontend files you edit directly — see `docs/CONTENT_MANAGEMENT.md`.

## What Changed Recently

This codebase went through a deliberate simplification: photo/facility/nearby-place/homestay-info
admin CRUD was removed in favor of static frontend content files, and dynamic pricing + real
online payment (Razorpay) were added. If you're picking up an existing deployment of an earlier
version of this project, **read `docs/MIGRATION_NOTES.md` before touching the database.**

## Tech Stack

- **Frontend:** React 18 (Vite) + Tailwind CSS + React Router + React Hook Form
- **Backend:** Java 17 + Spring Boot 3 + Spring Data JPA + Spring Security (JWT)
- **Database:** MySQL 8
- **Payments:** Razorpay (server-verified — see `docs/PAYMENT_SETUP.md`)

## Project Structure

```
homestay-project/
├── backend/                    Spring Boot API (Maven project)
├── frontend/
│   ├── src/content/             <-- YOU edit these for text/content changes
│   │   ├── homestay.js          name, description, contact info, address, amenities
│   │   ├── rooms.js              room names, descriptions, photos, facilities (id matches DB room.id)
│   │   └── nearbyPlaces.js       nearby attractions
│   └── public/images/           <-- YOU put photos here
├── docs/                        schema, migration notes, payment setup, API docs
└── README.md
```

## Prerequisites

| Tool | Version | Check with |
|---|---|---|
| Java (JDK) | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Node.js | 18+ | `node -v` |
| MySQL | 8+ | `mysql --version` |

## 1. Database Setup

New database:
```powershell
mysql -u root -p < docs/schema.sql
```
Upgrading an existing one: see `docs/MIGRATION_NOTES.md` instead.

## 2. Razorpay Setup

Follow `docs/PAYMENT_SETUP.md` to get your test-mode API keys. You need these before the booking
payment flow will work (the rest of the site works fine without them).

## 3. Backend Setup

```powershell
cd backend
copy .env.example .env
```
Edit `.env` (or set real environment variables) with your MySQL password and Razorpay test keys, then:

```powershell
$env:DB_PASSWORD="your_mysql_password"
$env:RAZORPAY_KEY_ID="rzp_test_..."
$env:RAZORPAY_KEY_SECRET="..."
mvn spring-boot:run
```

Watch for `Default admin created. Username: admin | Password: admin123` in the logs — that's
your login. **Change this password before going live** (see the security checklist in
`docs/SIMPLIFICATION_GUIDE.md`, section 11).

## 4. Frontend Setup

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```
Open `http://localhost:5173`.

## 5. Add Your Real Content

Everywhere you see the text `replace this text with...` or `replace this image with...` in
`frontend/src/content/*.js` and `frontend/public/images/`, that's a placeholder waiting for real
information — see `docs/CONTENT_MANAGEMENT.md` for the full list and exact file locations.

## 6. Set Real Prices

Log into `/admin/login` → **Pricing** → set weekday rate, weekend rate, extra-guest charge, and
discount for each room. These default to 0 — bookings will show ₹0 until you set them.

## Admin Panel

`/admin/login` (not linked from the public nav — bookmark it). Sections: Dashboard, Bookings &
Enquiries, Blocked Dates, Pricing. No photo/content management here by design — that's git-based
(see below).

## Making a Content Change (No Backend Involved)

1. Edit `frontend/src/content/*.js` and/or add photos to `frontend/public/images/`
2. `cd frontend && npm run build` (sanity check)
3. `git add . && git commit -m "..." && git push`
4. Redeploy the frontend only — the backend does not need to be touched for content changes

## Further Documentation

- `docs/CONTENT_MANAGEMENT.md` — exact file/field for every piece of static content
- `docs/schema.sql` — database schema + minimal room seed data
- `docs/MIGRATION_NOTES.md` — upgrading an existing database
- `docs/PAYMENT_SETUP.md` — Razorpay setup, test cards, going live
- `docs/API_DOCUMENTATION.md` — every backend endpoint
- `docs/SIMPLIFICATION_GUIDE.md` — the original static-vs-dynamic architecture rationale (still accurate for the content/pricing split)
- `docs/DEPLOYMENT.md` — low-cost production deployment
- `docs/SEO_AND_GOOGLE.md` — SEO + Google Business Profile + Search Console
