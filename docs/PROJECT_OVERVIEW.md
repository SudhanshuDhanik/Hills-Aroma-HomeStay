# Project Overview

## Business Model

This is a **marketing + enquiry website**, not a hotel-booking platform. The goal is:

1. Get found on Google (local SEO + Google Business Profile)
2. Show off the property (photos, rooms, prices, facilities, location, nearby attractions)
3. Let a customer check rough availability
4. Push the customer to WhatsApp/phone/email to actually finalize the booking with the owner
5. The owner manually confirms bookings and handles payment separately (UPI, cash, bank transfer)

Nothing about this system auto-confirms a booking or takes payment. That is intentional.

## Booking Status Model

Every booking has exactly one of three statuses:

- **PENDING** — a customer submitted an enquiry, or the owner is holding a soft booking. Does
  **not** guarantee the room.
- **CONFIRMED** — the owner has personally reviewed and confirmed this booking. Only an admin
  action can set this status (see `BookingController` / `BookingService.updateStatus`).
- **CANCELLED** — booking is cancelled and never blocks availability again.

A customer submitting the public enquiry form **always** creates a `PENDING` booking — even if
the dates look unavailable. This is deliberate: the owner may want to see the enquiry and offer
alternative dates rather than have the form silently reject it. Overlap protection only kicks in
hard when something is being promoted to `CONFIRMED`.

## Availability / Overlap Logic

**Convention:** a stay occupies the room for the half-open range `[checkIn, checkOut)`. The
check-out date itself is free — a new guest can check in on the day a previous guest checks out.

**Overlap test** for two ranges `[checkIn1, checkOut1)` and `[checkIn2, checkOut2)`:

```
checkIn1 < checkOut2  AND  checkIn2 < checkOut1
```

Example: Room 101 has a CONFIRMED booking from Sep 10 → Sep 13.

| New booking request | Overlaps? | Why |
|---|---|---|
| Sep 9 → Sep 10 | No | Ends exactly when the existing one starts |
| Sep 10 → Sep 11 | Yes | Starts on the existing check-in day |
| Sep 12 → Sep 14 | Yes | Overlaps the last night (12th) |
| Sep 13 → Sep 15 | No | Starts exactly on the existing check-out day — allowed |

This logic lives in `BookingRepository.findOverlapping()` as a single SQL query — see the
Javadoc comment at the top of `BookingService` for the full explanation.

**What blocks a room:**
- Any `PENDING` or `CONFIRMED` booking with overlapping dates → blocks the *availability check*
  shown to customers (a "soft" hold).
- Any `BlockedDate` entry (owner manually blocked, e.g. for maintenance) → also blocks availability.
- `CANCELLED` bookings never block anything.

**What's stricter:** promoting a booking to `CONFIRMED` (via `updateStatus` or manual booking
creation) is rejected with an HTTP 409 Conflict if it would overlap another **already-CONFIRMED**
booking on the same room. This is the one guarantee the system enforces in code: two customers
can never both hold a CONFIRMED booking for overlapping dates on the same room.

Why not reject PENDING enquiries on overlap too? Because two families might enquire about the
same dates before the owner responds to either — the owner should see both and decide, rather
than have the second person silently blocked from even asking.

## Database Design Rationale

We do **not** create one row per calendar date. With ~10 rooms and modest booking volume, storing
bookings as `(room_id, check_in, check_out, status)` ranges and computing overlap via a single
indexed SQL query is simpler, faster to build, and easier to reason about than a per-date
availability table. The composite index `(room_id, check_in, check_out, status)` on the `booking`
table keeps these overlap queries fast even as bookings accumulate over years.

## Architecture Layers (Backend)

```
Controller  → handles HTTP, validation triggers, status codes
   ↓
Service     → business logic (overlap checks, booking rules, DTO mapping)
   ↓
Repository  → Spring Data JPA interfaces, custom @Query for overlap logic
   ↓
MySQL
```

DTOs (`dto` package) are used everywhere instead of exposing JPA entities directly — this avoids
accidentally leaking internal fields and lets the API shape evolve independently of the database
schema.

## Security Model

- Public endpoints (`/api/homestay`, `/api/rooms`, `/api/enquiries`, etc.) require no auth.
- Admin endpoints (`/api/admin/**`) require a valid JWT in the `Authorization: Bearer <token>`
  header, obtained by logging in at `/api/admin/auth/login`.
- Passwords are hashed with BCrypt (`SecurityConfig.passwordEncoder()`), never stored in plaintext.
- CORS is restricted to the frontend origin(s) listed in `CORS_ALLOWED_ORIGINS`.
- A default admin account is auto-created on first run (`DataSeeder`) — **change this password**
  before going live. There's currently no "change password" UI in V1; simplest path is updating
  the `admin` table directly, or deleting the row and restarting with new `ADMIN_USERNAME`/
  `ADMIN_PASSWORD` env vars.

## Photo Management

- **Local dev:** `FileStorageService` saves uploads to a local `uploads/` folder, served at
  `/uploads/**` (see `WebConfig`). Simple, zero-cost, works out of the box.
- **Production:** swap `FileStorageService.store()` for a call to a cloud object storage
  provider (Cloudinary is recommended — free tier, automatic compression/WebP/CDN). Nothing
  else needs to change: the rest of the app only ever deals with a plain image URL string.

## Extending to Future Versions

The codebase is deliberately structured so these can be added later without a rewrite:

- **Online payment gateway:** hook into `BookingService.updateStatus()` — a payment webhook
  could call the same method a payment confirmation currently requires an admin to call manually.
- **Automatic booking confirmation:** would change the default status in `submitEnquiry()` from
  `PENDING` to `CONFIRMED`, with the overlap-conflict check now applied at submission time too.
- **WhatsApp Business API / SMS notifications:** would be triggered from `BookingService` after
  `submitEnquiry()` / `updateStatus()` — the service methods are already the natural place to
  add side effects like notifications.
- **Customer accounts:** would add a `Customer` entity and swap `guestName`/`phone`/`email` on
  `Booking` for a `Customer` foreign key.

None of these are implemented in V1, per the requirement to keep payment and automation out of
the first release — but the service-layer boundaries exist specifically so adding them later is
additive, not a redesign.
