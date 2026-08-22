# Migration Notes — Upgrading an Existing Database

If you already have a running database from the earlier version of this project (the one with
`RoomImage`, `Facility`, `NearbyPlace`, and `Homestay` tables), run these statements instead of
`docs/schema.sql` (which assumes a brand-new database).

**Back up first:**
```
mysqldump -u root -p homestay_db > backup-before-migration.sql
```

## 1. Drop the tables that became static frontend content

```sql
DROP TABLE IF EXISTS room_facilities;   -- join table, drop before facility/room_image
DROP TABLE IF EXISTS room_image;
DROP TABLE IF EXISTS facility;
DROP TABLE IF EXISTS nearby_place;
DROP TABLE IF EXISTS homestay;
```

## 2. Alter the `room` table for the new pricing model

The old `room` table had `description`, `bed_type`, `price` columns. The new one replaces
`price` with four pricing columns and adds `base_occupancy`:

```sql
ALTER TABLE room
  DROP COLUMN description,
  DROP COLUMN bed_type,
  CHANGE COLUMN price weekday_price DECIMAL(10,2) NOT NULL,
  ADD COLUMN weekend_price DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER weekday_price,
  ADD COLUMN extra_guest_price DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER weekend_price,
  ADD COLUMN discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER extra_guest_price,
  ADD COLUMN base_occupancy INT NOT NULL DEFAULT 2 AFTER max_guests;
```

**Important:** `weekday_price` is renamed from your old `price` column, so your existing prices
carry over as the weekday rate. Set the real `weekend_price` (and `extra_guest_price`/
`discount_percent` if applicable) via **Admin → Pricing** immediately after this migration —
they default to 0, which would let people book for free until you set them.

## 3. Alter the `booking` table for payment fields

```sql
ALTER TABLE booking
  ADD COLUMN total_amount DECIMAL(10,2) AFTER message,
  ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' AFTER total_amount,
  ADD COLUMN razorpay_order_id VARCHAR(100) AFTER payment_status,
  ADD COLUMN razorpay_payment_id VARCHAR(100) AFTER razorpay_order_id,
  ADD COLUMN razorpay_signature VARCHAR(255) AFTER razorpay_payment_id;
```

Existing bookings will have `payment_status = UNPAID` and `total_amount = NULL` — that's
correct, since they predate the payment system and were never paid online.

## 4. Verify `room.id` still matches `frontend/src/content/rooms.js`

This migration doesn't change any `id` values, so your existing room IDs are preserved. Just
confirm the `id` fields you write into `rooms.js` match what's actually in the `room` table:

```sql
SELECT id, name FROM room;
```

## 5. Restart the backend

With `spring.jpa.hibernate.ddl-auto=update`, Hibernate will recognize the new `Booking`/`Room`
entity shape matches what you just created above and won't attempt to re-add anything. Watch
the startup logs for any Hibernate schema-validation warnings.
