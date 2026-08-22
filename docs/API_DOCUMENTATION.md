# API Documentation

Base URL (local): `http://localhost:8080/api`

Admin endpoints require header: `Authorization: Bearer <jwt_token>` (obtained from login).
Dates use `YYYY-MM-DD` format.

---

## Public Endpoints

### `GET /api/rooms`
Returns all active rooms (identity/capacity/pricing only — photos/descriptions/facilities are
static frontend content, not returned by this API; see `frontend/src/content/rooms.js`).
- **Response 200:** array of `{ id, name, active, maxGuests, baseOccupancy, weekdayPrice, weekendPrice, extraGuestPrice, discountPercent }`

### `GET /api/rooms/{id}`
Single room, same shape as above.
- **Errors:** `404` if not found

### `GET /api/rooms/{id}/price?checkIn=&checkOut=&guests=`
Backend-computed price breakdown for a stay. Shown to the customer before payment — always
recomputed again server-side when an order is actually created, so this can never drift from
what's charged.
- **Response 200:** `{ roomId, checkIn, checkOut, guests, nights, weekdayNights, weekendNights, roomTotal, extraGuestTotal, subtotal, discountAmount, totalAmount }`
- **Errors:** `400` invalid dates/guest count, `404` room not found

### `GET /api/rooms/{roomId}/availability?checkIn=&checkOut=`
- **Response 200:** `{ roomId, checkIn, checkOut, available: boolean }`

### `GET /api/rooms/{roomId}/blocked-dates`
- **Response 200:** array of `{ id, roomId, startDate, endDate, reason }`

### `POST /api/enquiries`
Creates a `PENDING` booking with no payment — for customers who'd rather arrange payment
directly (UPI/cash) via WhatsApp/phone.
- **Body:** `{ roomId, guestName, phone, whatsapp, email, checkIn, checkOut, guests, message }`
- **Response 200:** `BookingResponse` with `status: "PENDING"`, `paymentStatus: "UNPAID"`

### `POST /api/payments/create-order`
Step 1 of online payment. Validates guest count + availability, computes the price, creates a
`PENDING`/`UNPAID` booking row, and creates a matching Razorpay order for that exact amount.
Nothing is charged yet.
- **Body:** `{ roomId, guestName, phone, whatsapp, email, checkIn, checkOut, guests, message }`
- **Response 200:** `{ bookingId, razorpayOrderId, amountInPaise, currency, razorpayKeyId, homestayName }`
- **Errors:** `400` invalid guests/dates, `404` room not found, `409` room not available for those dates

### `POST /api/payments/verify`
Step 2, called by the frontend after Razorpay Checkout reports success. Verifies the payment
signature server-side (HMAC-SHA256) before confirming anything — the frontend's claim of
success is never trusted alone.
- **Body:** `{ bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature }`
- **Response 200:** `BookingResponse` with `status: "CONFIRMED"`, `paymentStatus: "PAID"` (or
  `status: "PENDING"`, `paymentStatus: "PAID"` in the rare case of a conflicting booking — see
  `docs/PAYMENT_SETUP.md`)
- **Errors:** `402 Payment Required` if the signature doesn't verify, `404` if booking/order not found

---

## Admin Endpoints

### `POST /api/admin/auth/login`
- **Body:** `{ "username": "admin", "password": "..." }`
- **Response 200:** `{ "token": "<jwt>", "username": "admin" }`
- **Errors:** `401` wrong credentials

### Room pricing (the only room-editing admin surface)
- `GET /api/admin/rooms` — all rooms including inactive. **Auth required.**
- `POST /api/admin/rooms` — create a room (rare — usually done once when adding a physical
  room). Body: `{ name, active, maxGuests, baseOccupancy, weekdayPrice, weekendPrice, extraGuestPrice, discountPercent }`. **Auth required.**
- `PUT /api/admin/rooms/{id}` — full update, same body shape. **Auth required.**
- `PATCH /api/admin/rooms/{id}/pricing` — narrow update, only rates: `{ weekdayPrice, weekendPrice, extraGuestPrice, discountPercent }`. This is what the Admin -> Pricing screen uses. **Auth required.**
- `DELETE /api/admin/rooms/{id}`. **Auth required.**

### Booking management
- `GET /api/admin/bookings` — all bookings, newest first. **Auth required.**
- `GET /api/admin/rooms/{roomId}/bookings` — bookings for one room. **Auth required.**
- `POST /api/admin/bookings` — create a booking manually (e.g. phone booking, no online
  payment). Body same as enquiry, plus optional `status` (`PENDING`/`CONFIRMED`) and optional
  `totalAmount`. **Auth required.** `409` if confirming an overlapping CONFIRMED booking.
- `PATCH /api/admin/bookings/{id}/status` — `{ "status": "CONFIRMED" }`. **Auth required.**
  `409` on overlap when confirming.

### Blocked dates
- `POST /api/admin/blocked-dates` — `{ roomId, startDate, endDate, reason }`. **Auth required.**
- `DELETE /api/admin/blocked-dates/{id}`. **Auth required.**

---

## `BookingResponse` shape (returned by enquiries, payments, and admin booking endpoints)

```json
{
  "id": 12,
  "roomId": 1,
  "roomName": "Double Bed",
  "guestName": "Jane Doe",
  "phone": "9999999999",
  "whatsapp": "9999999999",
  "email": "jane@example.com",
  "checkIn": "2026-09-10",
  "checkOut": "2026-09-13",
  "guests": 2,
  "message": null,
  "status": "CONFIRMED",
  "totalAmount": 6500.00,
  "paymentStatus": "PAID",
  "createdAt": "2026-08-20T10:15:30",
  "updatedAt": "2026-08-20T10:16:02"
}
```

## Error Response Shape

```json
{ "timestamp": "2026-08-20T10:15:30", "status": 404, "error": "Room not found: 5" }
```
Validation errors additionally include a `fields` object.

## HTTP Status Codes Used

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Validation / invalid input (bad dates, guest count over capacity, etc.) |
| 401 | Missing/invalid JWT, or bad login credentials |
| 402 | Payment signature verification failed |
| 404 | Resource not found |
| 409 | Booking conflict (room unavailable / confirming an overlapping CONFIRMED booking) |
| 500 | Unexpected server error |

## Testing

Swagger UI (once the backend is running): `http://localhost:8080/swagger-ui.html`
