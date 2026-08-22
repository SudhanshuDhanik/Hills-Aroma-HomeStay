# Content Management Map

Every piece of static content lives in one of three files, or in `public/images/`. Nothing
listed here requires a backend change or redeploy.

| What to change | File | Field / location |
|---|---|---|
| Homestay name | `frontend/src/content/homestay.js` | `name` |
| About text / description | `frontend/src/content/homestay.js` | `description` |
| Address | `frontend/src/content/homestay.js` | `address` |
| Distance from Almora | `frontend/src/content/homestay.js` | `distanceFromAlmoraKm` |
| Distance from Jageshwar (Location page) | `frontend/src/content/homestay.js` | `distanceFromJageshwarKm` |
| Phone number | `frontend/src/content/homestay.js` | `phone` |
| WhatsApp number | `frontend/src/content/homestay.js` | `whatsapp` (digits only, no +) |
| Email | `frontend/src/content/homestay.js` | `email` |
| Google Maps embed | `frontend/src/content/homestay.js` | `mapEmbedUrl` |
| Hero image | `frontend/public/images/hero/` + `homestay.js` `heroImage` path |
| Logo | `frontend/public/images/` + `homestay.js` `logo` path (also update `Navbar.jsx` if adding one for the first time) |
| Amenities (Parking, Pets, etc.) | `frontend/src/content/homestay.js` | `amenities` array |
| Room name/description | `frontend/src/content/rooms.js` | that room's `name` / `description` |
| Room photos | `frontend/public/images/rooms/` + that room's `images` array in `rooms.js` |
| Room facilities list | `frontend/src/content/rooms.js` | that room's `facilities` array |
| Room max guests | `frontend/src/content/rooms.js` **and** the database `room.max_guests` column (via Admin → Pricing screen's underlying room record, or direct SQL) — these must match, since the frontend shows this number but the backend enforces it |
| Nearby places | `frontend/src/content/nearbyPlaces.js` | array entries |
| SEO title/description per page | Inside each page file, e.g. `frontend/src/pages/Home.jsx` | the `<SEO title="..." description="..." />` props |
| Site URL (for canonical links) | `frontend/src/components/SEO.jsx` | `siteUrl` constant |

## What's NOT here (dynamic — backend/database, via Admin panel)

- **Weekday/weekend/extra-guest rates, discount** — Admin → Pricing
- **Bookings, booking status** — Admin → Bookings & Enquiries
- **Blocked dates** — Admin → Blocked Dates

## Placeholder Convention

Any value starting with the literal text `replace this text with` or `replace this image with`
is a placeholder — the client hadn't provided that specific piece of information yet. Search the
codebase for that phrase to find everything still needing real content before launch:

```powershell
cd frontend/src/content
grep -rn "replace this" .
```
