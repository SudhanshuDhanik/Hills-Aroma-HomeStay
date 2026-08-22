# Homestay Project — Simplification Guide

Based on direct inspection of your existing codebase (not a regeneration). All paths below are
real files in your project.

---

## 1. Current Architecture (As Built)

```
React frontend ──(axios, every public page)──> Spring Boot REST API ──> MySQL
      │                                              │
      ├─ Home, About, Rooms, Gallery, Location,      ├─ Homestay (1 row) — name, desc, contact
      │  Contact all fetch content live from API     ├─ Room, RoomImage, Facility (+ join table)
      │                                              ├─ NearbyPlace
      └─ /admin/* — full CRUD for all of the above   └─ Booking, BlockedDate, Admin
```

Every "static" thing (homestay bio, room descriptions, facilities, nearby places, photos) is
currently **database-backed and API-driven**, with a full admin CRUD UI to manage it. That's the
part we're removing. Bookings/availability/admin auth stay exactly as they are.

## 2. Current Authentication Flow (verified by inspecting the code, not assumed)

- `POST /api/admin/auth/login` (`AuthController.java`) — the **only** auth endpoint that exists.
  I searched the entire backend for `register`/`signup` — **there is none**. Public registration
  was never implemented, so there's nothing to remove on that front.
- `AuthService.login()` checks `AdminRepository.findByUsername()`, then
  `passwordEncoder.matches(rawPassword, admin.getPassword())` — a BCrypt comparison.
- The one and only admin row is created by `DataSeeder.java` (a `CommandLineRunner`) on backend
  startup, reading `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars (defaulting to `admin`/`admin123`
  if unset). This is **not** an HTTP endpoint — it cannot be triggered remotely, only runs once
  when the JVM boots.
- `JwtUtil.java` signs/verifies tokens with a secret from `app.jwt.secret`.
- `JwtAuthFilter.java` reads the `Authorization: Bearer <token>` header, and if valid, grants the
  request `ROLE_ADMIN` — this is hardcoded (there's only one account type in this system, so this
  is fine as-is; see Section 11 for the one real risk here).
- `SecurityConfig.java` requires authentication for `/api/admin/**` except `/api/admin/auth/**`
  (the login endpoint itself, which must be reachable without a token).

**Direct answers to your Concern 4 questions:**

| Question | Answer |
|---|---|
| Public registration enabled? | No — doesn't exist in the code |
| Can any user become admin? | No — no such endpoint |
| Where is admin role defined? | `Admin.java` entity, `role` field |
| Where is admin user created? | `DataSeeder.java`, at backend startup only |
| Password hashed? | Yes, BCrypt (`SecurityConfig.passwordEncoder()`) |
| Can someone call the API to become admin? | No — `DataSeeder` isn't HTTP-reachable |
| JWT secure enough? | Yes, mechanism is fine — but the **default secret value is weak** (Section 11, HIGH PRIORITY) |

**Nothing needs to change here.** Your instinct that this was risky was reasonable to check, but
the implementation already matches exactly what you asked for: one pre-created admin, no signup.

## 3. Current Admin Flow

- Frontend route: `/admin/login` (`App.jsx`, line: `<Route path="/admin/login" element={<AdminLogin />} />`)
- This route is **not** in the public `Navbar.jsx` links array — I checked, and there's no
  "Admin" link anywhere in the public nav. It's already exactly what you wanted: reachable only
  by typing the URL directly.
- After login, `/admin` (protected by `ProtectedRoute.jsx`, which checks `localStorage.admin_token`)
  loads `AdminLayout.jsx`, which currently has **7 nav sections**: Dashboard, Rooms, Bookings &
  Enquiries, Blocked Dates, Facilities, Nearby Places, Homestay Info.
- Of these, **4 are being removed** in this simplification (Rooms, Facilities, Nearby Places,
  Homestay Info) — see Section 8.

**Owner login URL:** `https://yourdomain.com/admin/login` — nothing to build, it already works
this way.

## 4. Current Image/Content Flow (Concern 1 — full answer)

Direct answers, in order:

1. **Where images are stored:** `backend/uploads/` on the server's local disk (`FileStorageService.java`
   writes there), served at `/uploads/**` (`WebConfig.java` maps this as a static resource handler).
2. **How frontend references images:** `RoomImage.imageUrl` (a string like `/uploads/abc123.jpg`)
   stored in MySQL, returned via `GET /api/rooms` and `GET /api/rooms/{id}`, rendered directly as
   `<img src={image.imageUrl}>` in `RoomCard.jsx` and `GalleryGrid.jsx`.
3. **Coming from backend/DB/API?** Yes — 100% dynamic, nothing is hardcoded currently.
4. **Can you safely replace with static frontend images?** Yes, safely — see Section 6 for exactly
   why nothing else depends on this.
5. **Which files need to change?** Full list in Section 8.
6. **Can DB image tables be removed?** Yes — `room_image` table and the `room_facilities` join
   table (both created by JPA from `RoomImage.java` and `Room.facilities`) have no other table
   depending on them. Safe to drop.
7. **Can upload APIs/services be removed?** Yes — `FileStorageService.java`, the two `@PostMapping`/`@DeleteMapping`
   image endpoints in `RoomController.java`, and the `/uploads/**` mapping in `WebConfig.java` can
   all be deleted.
8. **Will removing them break anything?** No — I traced every reference. Nothing outside the
   Room/RoomImage/RoomController/RoomService cluster touches image upload. `Booking` and
   `BlockedDate` only reference `Room` by ID, never by image data.

## 5. Current Booking/Availability Flow — Do Not Touch

I want to be explicit about what's staying **completely unchanged**, since it's easy to
accidentally break this while removing the content-management stuff:

- `Room` entity/table — **stays**, because `Booking.room` and `BlockedDate.room` are real foreign
  keys pointing at it. Bookings are meaningless without a real `room_id` to attach to.
- `Booking`, `BlockedDate` entities, repositories, services, controllers — **entirely unchanged**.
- The overlap-checking logic in `BookingService.java`/`BookingRepository.findOverlapping()` —
  **unchanged**.
- `AdminBookings.jsx`, `AdminBlockedDates.jsx`, `AdminDashboard.jsx` — **unchanged**. These call
  `getAdminRooms()` (a simple `GET /api/admin/rooms` for the room-picker dropdown), which keeps
  working exactly as-is — it just won't return image/facility data anymore after Section 8's
  entity trim, and neither of these pages currently reads that data anyway.

## 6. Static Content vs. Dynamic Data — The Actual Rule

| | STATIC (→ frontend files) | DYNAMIC (→ stays in DB) |
|---|---|---|
| **What** | Homestay bio, room descriptions/prices/photos/facilities, nearby places | Bookings, booking status, blocked dates |
| **Why** | Only changes when you (the developer) push an update | Changes constantly, from real customer/owner actions, must be queryable ("is this room free on these dates?") |
| **Who changes it** | You, via `git` + redeploy | The system itself, in real time, via API calls |
| **Consistency requirement** | None — a stale photo for 2 days doesn't break anything | Must be transactionally consistent — two customers must never both get a CONFIRMED booking for the same dates |

This is the correct dividing line, and it's why **Room itself is the one partial exception**: its
*identity* (a row with an ID) is dynamic-adjacent because Booking needs to point at something
real in the database — but its *description* (name, price, photos) is static. So Room keeps
existing as a table, but loses its content-management surface area.

---

## 7. Problems Found

| # | Issue | Priority |
|---|---|---|
| 1 | Default JWT secret (`local-dev-only-change-me...`) is a placeholder string, not a real secret | **HIGH** |
| 2 | Default admin password `admin123` will be live if `ADMIN_PASSWORD` env var isn't set before first deploy | **HIGH** |
| 3 | `backend/uploads/` is local disk — on most free hosting (Railway/Render), this is wiped on redeploy. Moot after this simplification since uploads are being removed entirely, but flagging in case you keep any upload feature elsewhere later | Medium (becomes N/A after Section 8) |
| 4 | No rate-limiting on `/api/admin/auth/login` — a scripted brute-force attempt isn't blocked | Low (fine at this scale, optional hardening) |
| 5 | Unnecessary admin CRUD surface area (Rooms/Facilities/NearbyPlaces/HomestayInfo) — not a security bug, but it's attack surface and complexity you don't need | Medium |

---

## 8. Exact File-by-File Change Plan

### BACKEND CHANGES

**Change 1 — Delete image upload entirely**

```
FILE: backend/src/main/java/com/homestay/backend/service/FileStorageService.java
CURRENT PURPOSE: Saves uploaded files to backend/uploads/ and returns a URL
PROBLEM: No longer needed — images are now static frontend files
CHANGE REQUIRED: Delete this file entirely
WHY: Nothing else calls it once Change 2 and 3 are done
RISK: Low
```

```
FILE: backend/src/main/java/com/homestay/backend/controller/RoomController.java
CURRENT PURPOSE: Public room GET endpoints + admin room CRUD + image upload/delete
CHANGE REQUIRED: Remove the FileStorageService dependency and these two methods:
    uploadImage(...)   [@PostMapping(".../images")]
    deleteImage(...)   [@DeleteMapping(".../images/{imageId}")]
  Also remove the unused imports: RoomImageDto, MultipartFile
WHY: These endpoints have no frontend caller after this change
RISK: Low
```

```
FILE: backend/src/main/java/com/homestay/backend/entity/RoomImage.java
CHANGE REQUIRED: Delete this file entirely
WHY: Room images are now static frontend files, not a DB entity
RISK: Low — nothing references RoomImage except Room.images and RoomImageRepository, both also being removed
```

```
FILE: backend/src/main/java/com/homestay/backend/repository/RoomImageRepository.java
CHANGE REQUIRED: Delete this file entirely
RISK: Low
```

```
FILE: backend/src/main/java/com/homestay/backend/dto/RoomImageDto.java
CHANGE REQUIRED: Delete this file entirely
RISK: Low
```

**Change 2 — Remove Facility (becomes static content)**

```
FILE: backend/src/main/java/com/homestay/backend/entity/Facility.java
FILE: backend/src/main/java/com/homestay/backend/repository/FacilityRepository.java
FILE: backend/src/main/java/com/homestay/backend/service/FacilityService.java
FILE: backend/src/main/java/com/homestay/backend/controller/FacilityController.java
FILE: backend/src/main/java/com/homestay/backend/dto/FacilityDto.java
CHANGE REQUIRED: Delete all five files entirely
WHY: Facilities are per-room descriptive text, not dynamic business data
DEPENDS ON THIS: Only Room.java (its `facilities` ManyToMany field — removed in Change 4)
                 and RoomDto.java (its `facilities` field — removed in Change 4)
RISK: Low
```

**Change 3 — Remove NearbyPlace (becomes static content)**

```
FILE: backend/src/main/java/com/homestay/backend/entity/NearbyPlace.java
FILE: backend/src/main/java/com/homestay/backend/repository/NearbyPlaceRepository.java
FILE: backend/src/main/java/com/homestay/backend/service/NearbyPlaceService.java
FILE: backend/src/main/java/com/homestay/backend/controller/NearbyPlaceController.java
FILE: backend/src/main/java/com/homestay/backend/dto/NearbyPlaceDto.java
CHANGE REQUIRED: Delete all five files entirely
WHY: Nothing else in the schema references NearbyPlace — it was always standalone
RISK: Low — verified zero foreign key relationships to this table
```

**Change 4 — Remove Homestay (becomes static content)**

```
FILE: backend/src/main/java/com/homestay/backend/entity/Homestay.java
FILE: backend/src/main/java/com/homestay/backend/repository/HomestayRepository.java
FILE: backend/src/main/java/com/homestay/backend/service/HomestayService.java
FILE: backend/src/main/java/com/homestay/backend/controller/HomestayController.java
FILE: backend/src/main/java/com/homestay/backend/dto/HomestayDto.java
CHANGE REQUIRED: Delete all five files entirely
WHY: This entity has zero foreign keys pointing to it from Room, Booking, or anywhere else —
     it was always a standalone "single row of settings" table, which is exactly the shape
     of data that belongs in a static config file instead
RISK: Low
```

**Change 5 — Trim Room entity and its DTO**

```
FILE: backend/src/main/java/com/homestay/backend/entity/Room.java
CURRENT PURPOSE: Room row, currently has `images` (OneToMany) and `facilities` (ManyToMany) fields
CHANGE REQUIRED: Remove these two fields and their imports:
    private Set<RoomImage> images = new HashSet<>();
    private Set<Facility> facilities = new HashSet<>();
  Keep everything else (id, name, description, price, maxGuests, bedType, active) —
  see note below on whether to trim further.
WHY: These fields reference the two entities deleted in Changes 1 & 2
RISK: Low
```

```
FILE: backend/src/main/java/com/homestay/backend/dto/RoomDto.java
CHANGE REQUIRED: In RoomResponse, remove:
    private List<RoomImageDto> images;
    private List<FacilityDto> facilities;
  In RoomRequest, remove:
    private Set<Long> facilityIds;
RISK: Low
```

```
FILE: backend/src/main/java/com/homestay/backend/service/RoomService.java
CHANGE REQUIRED:
  - Remove addImage(), deleteImage(), resolveFacilities() methods
  - Remove the RoomImageRepository and FacilityRepository constructor params/fields
  - In toDto(), remove the .setImages(...) and .setFacilities(...) blocks
  - In create()/update(), remove .facilities(resolveFacilities(...)) / .setFacilities(...) calls
RISK: Low — purely deletion of now-dead code paths
```

> **Optional further trim (your call, not required):** Since `description`, `price`, `bedType`
> also become "display text" that's duplicated in the frontend, you *could* also strip Room down
> to just `id`, `name`, `active`. I'd recommend **against** this for now — keeping `price` on the
> Room row is genuinely useful later if you ever want the backend to validate booking totals or
> show price in the admin booking list, and it costs you nothing to leave it. Don't optimize this
> away just for the sake of it.

**Change 6 — Simplify RoomController to just what's used**

```
FILE: backend/src/main/java/com/homestay/backend/controller/RoomController.java
CHANGE REQUIRED: Decide whether to keep GET /api/rooms and GET /api/rooms/{id} at all.
  Nothing in the new frontend will call them (content comes from static files now).
  RECOMMENDATION: Keep them. They're harmless, cost nothing to leave running, and give you
  a working API to point at if you ever change your mind about static content later.
  Definitely keep: GET /api/admin/rooms (used by AdminBookings/AdminBlockedDates/AdminDashboard
  for the room-picker dropdown), POST/PUT/DELETE /api/admin/rooms (in case you occasionally add
  a physical room via the admin UI instead of raw SQL — cheap to keep, your call).
RISK: N/A — this is a keep-or-remove judgment call, not a required change
```

**Change 7 — Remove now-unused upload configuration**

```
FILE: backend/src/main/java/com/homestay/backend/config/WebConfig.java
CHANGE REQUIRED: Delete this file entirely (its only job was mapping /uploads/**)
RISK: Low
```

```
FILE: backend/src/main/resources/application.properties
CHANGE REQUIRED: Remove these now-unused lines:
    app.upload.dir=${UPLOAD_DIR:uploads}
    spring.servlet.multipart.max-file-size=10MB
    spring.servlet.multipart.max-request-size=10MB
RISK: Low
```

```
FILE: backend/pom.xml
CHANGE REQUIRED: No dependency removal needed — multipart support is built into
  spring-boot-starter-web, not a separate dependency. Nothing to change here.
RISK: N/A
```

**Change 8 — Database migration (run manually, once)**

Hibernate's `ddl-auto=update` only ever *adds* tables/columns — it never drops them. After
deploying the code changes above, manually run this against your database:

```sql
DROP TABLE IF EXISTS room_facilities;   -- join table, drop before facility/room_image
DROP TABLE IF EXISTS room_image;
DROP TABLE IF EXISTS facility;
DROP TABLE IF EXISTS nearby_place;
DROP TABLE IF EXISTS homestay;
```

Do this **after** confirming the new backend code deploys and runs successfully (so if something
goes wrong, you haven't already destroyed data you might want to reference). `room`, `booking`,
`blocked_date`, and `admin` tables are untouched.

---

### FRONTEND CHANGES

**Change 9 — Create the static content files**

```
FILE: frontend/src/content/homestay.js   (NEW FILE)
CHANGE REQUIRED: Create with this shape:

export const homestay = {
  name: 'Mountain View Homestay',
  description: 'A cozy 10-room homestay...',
  address: '123 Hilltop Road, Mussoorie, Uttarakhand, India',
  phone: '+919999999999',
  whatsapp: '919999999999',       // digits only, no + — this is what wa.me needs
  email: 'contact@mountainviewhomestay.example',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=...',
  heroImage: '/images/hero.jpg',
}

WHY: Single source of truth for every piece of contact info — this is what Concern 9 asks for
RISK: N/A (new file)
```

```
FILE: frontend/src/content/rooms.js   (NEW FILE)
CHANGE REQUIRED: Create with this shape. The `id` field MUST match the real Room.id
  in your MySQL `room` table — this is the number the booking APIs use.

export const rooms = [
  {
    id: 1,                         // <-- matches backend Room.id, do not change casually
    name: 'Deluxe Mountain View Room',
    description: 'Spacious room with a private balcony...',
    price: 2500,
    maxGuests: 3,
    bedType: 'Queen',
    images: [
      { url: '/images/rooms/deluxe-1.jpg', alt: 'Deluxe room with mountain view' },
      { url: '/images/rooms/deluxe-2.jpg', alt: 'Deluxe room bathroom' },
    ],
    facilities: ['Wi-Fi', 'Hot Water', 'Mountain View', 'Room Service'],
  },
  // ...repeat for each of your ~10 rooms
]

RISK: N/A (new file)
```

```
FILE: frontend/src/content/nearbyPlaces.js   (NEW FILE)
CHANGE REQUIRED: Create with this shape:

export const nearbyPlaces = [
  {
    name: 'Kempty Falls',
    description: 'A popular waterfall with pools for bathing.',
    image: '/images/nearby/kempty-falls.jpg',
    distanceKm: 15,
    travelTimeMinutes: 30,
    activities: 'Swimming, photography, cable car ride',
  },
  // ...
]

RISK: N/A (new file)
```

Facilities don't need their own file — they're just short strings inside each room object in
`rooms.js` (see above). A separate `facilities.js` would add a layer of indirection for no
benefit at this scale.

**Change 10 — Add the images**

```
FILE: frontend/public/images/hero.jpg
FILE: frontend/public/images/rooms/*.jpg
FILE: frontend/public/images/nearby/*.jpg
CHANGE REQUIRED: Put your actual photo files here (create the folders)
WHY: see Concern 8 answer below for public/ vs src/assets/ reasoning
RISK: N/A
```

**Change 11 — Rewire every page from API calls to static imports**

```
FILE: frontend/src/pages/Home.jsx
CURRENT: useEffect(() => { getHomestay().then(setHomestay)... getRooms()... getFacilities()... })
CHANGE TO: import { homestay } from '../content/homestay'
           import { rooms } from '../content/rooms'
           — delete the useEffect/useState entirely, reference `homestay` and `rooms` directly
           — facilities section: derive a flat unique list from rooms.flatMap(r => r.facilities),
             or just remove that section if you don't need a global facilities badge row
WHY: No more network round-trip needed for content that never changes at runtime
RISK: Low — purely a data-source swap, JSX structure barely changes
```

```
FILE: frontend/src/pages/About.jsx
CHANGE: Replace getHomestay() call with `import { homestay } from '../content/homestay'`
RISK: Low
```

```
FILE: frontend/src/pages/Rooms.jsx
CHANGE: Replace getRooms() call with `import { rooms } from '../content/rooms'`
  Remove the loading state — there's nothing async to wait for anymore
RISK: Low
```

```
FILE: frontend/src/pages/RoomDetail.jsx
CHANGE: Replace `getRoom(id)` (API call) with:
    import { rooms } from '../content/rooms'
    const room = rooms.find(r => r.id === Number(id))
  IMPORTANT: Keep passing room.id to <AvailabilityCalendar roomId={room.id} .../> and
  <EnquiryForm roomId={room.id} .../> exactly as before — these two components still need
  the real numeric ID to call the booking API. This is the one place static content and
  dynamic booking data connect.
RISK: Low — same reasoning
```

```
FILE: frontend/src/pages/Gallery.jsx
CHANGE: Replace `getRooms().then(rooms => rooms.flatMap(r => r.images))` with:
    import { rooms } from '../content/rooms'
    const images = rooms.flatMap(r => r.images)
RISK: Low
```

```
FILE: frontend/src/pages/Location.jsx
CHANGE: Replace getHomestay()/getNearbyPlaces() with:
    import { homestay } from '../content/homestay'
    import { nearbyPlaces as places } from '../content/nearbyPlaces'
RISK: Low
```

```
FILE: frontend/src/pages/Contact.jsx
CHANGE: Replace getHomestay()/getRooms() with static imports from content/homestay.js and
  content/rooms.js (rooms is still needed here for the enquiry form's room-picker dropdown)
RISK: Low
```

```
FILE: frontend/src/components/EnquiryForm.jsx
CHANGE: Replace the `getRooms()` call (used only for the room-picker dropdown when no
  fixed roomId is passed) with `import { rooms } from '../content/rooms'`
  The actual form submission (`submitEnquiry`) still calls the real backend API — that part
  is unchanged, since submitting an enquiry is dynamic data.
RISK: Low
```

```
FILE: frontend/src/components/Navbar.jsx, Footer.jsx, WhatsAppButton.jsx
CURRENT: Read `import.meta.env.VITE_HOMESTAY_NAME` / `VITE_WHATSAPP_NUMBER` directly
CHANGE: Replace with `import { homestay } from '../content/homestay'`, use
  `homestay.name` / `homestay.whatsapp` instead of the env vars
WHY: This is Concern 9's "change the phone number in one place" — content/homestay.js becomes
  that one place. (These files were already halfway there via env vars — now fully consolidated.)
RISK: Low
```

**Change 12 — Remove now-dead API client files**

```
FILE: frontend/src/api/homestayApi.js
FILE: frontend/src/api/facilityApi.js
FILE: frontend/src/api/nearbyPlaceApi.js
CHANGE REQUIRED: Delete all three entirely
WHY: Nothing calls these functions after Change 11
RISK: Low
```

```
FILE: frontend/src/api/roomApi.js
CHANGE REQUIRED: Remove: getRooms, getRoom, createRoom, updateRoom, deleteRoom,
  uploadRoomImage, deleteRoomImage
  KEEP: getAdminRooms (used by AdminBookings/AdminBlockedDates/AdminDashboard),
  checkAvailability (used by AvailabilityCalendar — this is dynamic data, stays as-is)
RISK: Low
```

**Change 13 — Remove the 4 admin content-management pages**

```
FILE: frontend/src/admin/AdminRooms.jsx
FILE: frontend/src/admin/AdminFacilities.jsx
FILE: frontend/src/admin/AdminNearbyPlaces.jsx
FILE: frontend/src/admin/AdminHomestayInfo.jsx
CHANGE REQUIRED: Delete all four entirely
RISK: Low — these were purely CRUD UIs for the content now managed via git
```

```
FILE: frontend/src/App.jsx
CHANGE REQUIRED: Remove the imports and <Route> entries for the 4 deleted admin pages:
    AdminRooms, AdminFacilities, AdminNearbyPlaces, AdminHomestayInfo
  KEEP: AdminDashboard, AdminBookings, AdminBlockedDates routes exactly as-is
RISK: Low
```

```
FILE: frontend/src/admin/AdminLayout.jsx
CHANGE REQUIRED: In the `links` array, remove these four entries:
    { to: '/admin/rooms', label: 'Rooms' }
    { to: '/admin/facilities', label: 'Facilities' }
    { to: '/admin/nearby-places', label: 'Nearby Places' }
    { to: '/admin/homestay-info', label: 'Homestay Info' }
  Resulting admin nav: Dashboard, Bookings & Enquiries, Blocked Dates — exactly matching
  Concern 5's list of what the admin should be able to do.
RISK: Low
```

**Change 14 — Frontend env cleanup**

```
FILE: frontend/.env.example, frontend/.env
CHANGE REQUIRED: Remove VITE_HOMESTAY_NAME and VITE_WHATSAPP_NUMBER (now in content/homestay.js)
  KEEP: VITE_API_BASE_URL (still needed — booking/availability/enquiry/admin-login APIs are real)
RISK: Low
```

---

## 9. Content Management Map

| What I want to change | File | What to change |
|---|---|---|
| Homestay name | `frontend/src/content/homestay.js` | `name` field |
| Homestay description | `frontend/src/content/homestay.js` | `description` field |
| Hero image | `frontend/public/images/hero.jpg` + `frontend/src/content/homestay.js` (`heroImage` path) | Replace file, update path if renamed |
| Room 1 image | `frontend/public/images/rooms/` + `frontend/src/content/rooms.js` (that room's `images` array) | Replace file, update path if renamed |
| Room 1 price | `frontend/src/content/rooms.js` | That room object's `price` field |
| Room description | `frontend/src/content/rooms.js` | That room object's `description` field |
| Facilities (per room) | `frontend/src/content/rooms.js` | That room object's `facilities` array |
| Nearby places | `frontend/src/content/nearbyPlaces.js` | Add/edit/remove array entries |
| Phone number | `frontend/src/content/homestay.js` | `phone` field |
| WhatsApp number | `frontend/src/content/homestay.js` | `whatsapp` field |
| Email | `frontend/src/content/homestay.js` | `email` field |
| Address | `frontend/src/content/homestay.js` | `address` field |
| Google Maps URL | `frontend/src/content/homestay.js` | `mapEmbedUrl` field |
| SEO title (per page) | Inside each page file, e.g. `frontend/src/pages/Home.jsx` | The `<SEO title="..." />` prop |
| SEO description (per page) | Same page files | The `<SEO description="..." />` prop |
| Logo | `frontend/public/logo.png` (new) + `frontend/src/components/Navbar.jsx` | Add file, swap the text logo for `<img src="/logo.png" />` |
| Favicon | `frontend/public/favicon.ico` (create/replace) | Referenced automatically by Vite's default `index.html` |

---

## 10. Image Replacement Guide (Concern 8)

**Use `frontend/public/images/`, not `src/assets/`.** Reasoning: your content lives in plain JS
data files (`rooms.js`, `nearbyPlaces.js`) as path *strings* — `public/` files are served at a
fixed root-relative URL (`/images/rooms/deluxe-1.jpg`) with zero import statements needed. If you
used `src/assets/`, every image would need an explicit `import` in a component, which defeats the
point of having all room data in one clean array in `rooms.js`. The tradeoff you give up is
Vite's automatic cache-busting hash on `src/assets` files — for a 10-room homestay updated
occasionally, that's a non-issue. If you ever swap a photo and it doesn't visually update after
deploy, that's just browser cache — rename the file (e.g. `deluxe-1.jpg` → `deluxe-1-v2.jpg`) and
update the path in `rooms.js`, and the cache problem disappears.

**Procedure:**
1. Put the new file in `frontend/public/images/rooms/` (or `nearby/`, or the root `images/` folder for hero/logo)
2. Open `frontend/src/content/rooms.js` (or `nearbyPlaces.js` / `homestay.js`)
3. Find the room's `images` array (or the relevant field)
4. Change the `url` string to match the new filename
5. Run `npm run build` inside `frontend/`
6. Run `npm run preview` and check the change locally
7. Commit, push, deploy (see Section 12)

**Filenames:** use lowercase, hyphens, no spaces — e.g. `deluxe-room-balcony.jpg`, not
`Deluxe Room (1).jpg`. Spaces get URL-encoded to `%20` and are a common source of broken image
links when a path string in `rooms.js` doesn't exactly match. Special characters beyond hyphens
and letters/numbers should be avoided for the same reason.

**Format/size:** JPG or WebP, resize to roughly 1600px on the longer edge for room/gallery photos
(no need for anything larger — it just slows page load), compress to under ~300KB using something
like Squoosh (free, web-based) before adding to the repo.

---

## 11. Production Security Checklist (Concern 16-I)

- [ ] **HIGH — Set a real `JWT_SECRET`.** Generate one with `openssl rand -base64 48` and set it
  as an environment variable in production. The default value in `application.properties` is
  labeled "local-dev-only" for a reason — never let that ship live.
- [ ] **HIGH — Set a real `ADMIN_PASSWORD`.** Set `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars
  *before* the backend's first production startup (this is when `DataSeeder` creates the account).
  If you already started it once with the defaults, the fix is: manually update the `admin` table's
  password column with a fresh BCrypt hash, or delete that row and restart with new env vars set.
- [ ] Confirm `CORS_ALLOWED_ORIGINS` in production points only at your real frontend domain, not
  `localhost`.
- [ ] Confirm `.env` files are in `.gitignore` and were never committed (check `git log -- '*.env'`
  on your repo to be sure).
- [ ] After Section 8's DB migration, confirm the dropped tables (`homestay`, `facility`,
  `nearby_place`, `room_image`, `room_facilities`) are actually gone and the app still starts
  cleanly with `ddl-auto=update`.
- [ ] Test that a request to a deleted endpoint (e.g. old `/api/admin/facilities`) now correctly
  404s instead of silently doing something unexpected.

---

## 12. Deployment / Change Procedure (Concern 15)

**For a content-only change (photo, room text, facilities, nearby places, contact info):**

1. Edit the relevant file in `frontend/src/content/` and/or add files to `frontend/public/images/`
2. `cd frontend && npm run build` (sanity check it compiles)
3. `npm run preview` and eyeball the change locally
4. `git add . && git commit -m "Update room 3 photos"` and `git push`
5. If deployed on Vercel/Netlify with GitHub integration: **that's it** — it auto-redeploys on push
6. If deploying manually: re-run whatever upload/deploy step you use for the frontend build output

**Backend redeploy is NOT required for any content change** — the backend no longer stores or
serves this content at all after this simplification. You only need to touch/redeploy the backend
when you change booking logic, security config, or backend environment variables.

---

## 13. Final Simplified Architecture

```
PUBLIC WEBSITE
React (static content baked into the build)
  ├─ content/homestay.js, rooms.js, nearbyPlaces.js  ─┐
  └─ public/images/                                    ├─ compiled at `npm run build` time
                                                          ↓
  Availability check / Enquiry submit  ──────>  Spring Boot API (GET availability, POST enquiry)
                                                          ↓
                                                        MySQL (room [id/name/price only used for
                                                        FK + admin dropdown], booking, blocked_date, admin)

ADMIN
/admin/login → Spring Security (JWT) → ADMIN role
  → Dashboard / Bookings & Enquiries / Blocked Dates ONLY
```

## 14. Final User Flows

**Customer:** Google → static React site (instant load, no API wait for content) → browses
photos/rooms/facilities (all baked into the build) → checks availability (real API call) →
WhatsApp/call the owner → owner confirms → owner logs into `/admin` → marks booking CONFIRMED →
calendar updates for future availability checks.

**Owner:** `/admin/login` → Dashboard → Bookings & Enquiries (view/confirm/cancel) → Blocked Dates
(block maintenance days). Nothing else — no photo/text management in the admin panel by design.

**You (developer):** Client sends new photos/text → edit `content/*.js` + `public/images/` →
`npm run build` → `git push` → auto-deploy (or manual upload) → done. Backend untouched.
