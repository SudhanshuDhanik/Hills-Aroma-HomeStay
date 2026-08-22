# Payment Setup (Razorpay)

This project integrates Razorpay directly via REST calls (no SDK dependency) — see
`backend/src/main/java/com/homestay/backend/service/RazorpayService.java`.

## 1. Create a Razorpay account

1. Sign up at **dashboard.razorpay.com**.
2. Complete KYC to enable live payments (you can build/test everything before KYC completes,
   using test mode).

## 2. Get your API keys

1. Dashboard → **Settings → API Keys**.
2. Generate a **Test Mode** key pair first — you'll get a `Key Id` (starts `rzp_test_...`) and
   a `Key Secret` (shown once — copy it immediately).
3. Set these as backend environment variables:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
   ```
4. **Never** put the Key Secret in the frontend, in `.env` files under `frontend/`, or in any
   file that gets committed to Git. Only `RAZORPAY_KEY_ID` (the public key) is ever sent to the
   browser, and even that happens dynamically via the `/api/payments/create-order` response —
   it's never hardcoded in frontend source.

## 3. Test the flow in Test Mode

With test keys configured, Razorpay Checkout will open in test mode automatically. Use these
official test card numbers (see Razorpay's docs for the current list — search "razorpay test
cards" if these become outdated):

- **Card:** 4111 1111 1111 1111, any future expiry, any CVV — simulates a successful payment
- **UPI:** use `success@razorpay` as the UPI ID to simulate a successful UPI payment

No real money moves in test mode. Confirm:
- [ ] `POST /api/payments/create-order` returns an order ID
- [ ] Razorpay Checkout opens with the correct amount
- [ ] A successful test payment redirects to `/booking-confirmation` with status `CONFIRMED`/`PAID`
- [ ] The booking appears in **Admin → Bookings & Enquiries** with the correct amount and PAID status
- [ ] Booking two overlapping test payments for the same room/dates back-to-back — the second
      should either show "not available" before payment, or (if both somehow reach payment) the
      second's booking should land as PENDING+PAID (not CONFIRMED) per the conflict-safety logic
      in `PaymentService.verifyPayment()` — check the admin dashboard for this case if you test it

## 4. Go live

1. Complete KYC in the Razorpay dashboard if you haven't already.
2. Generate **Live Mode** keys (Settings → API Keys → toggle to Live).
3. Replace the `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` environment variables in your production
   deployment with the live values.
4. Do a real ₹1 test booking yourself before announcing the site is live, to confirm the full
   flow works with real money end to end.

## What This Integration Does NOT Do

- No automatic refunds — if a payment succeeds but a booking conflict is found (a very rare
  race condition), the booking is left `PENDING`/`PAID` for the owner to manually resolve
  (contact the guest, offer new dates, or issue a refund via the Razorpay dashboard directly).
- No email/SMS/WhatsApp receipt is sent automatically — the confirmation page (with a
  Print/Save-as-PDF button) is the only proof-of-booking currently implemented. Don't tell
  guests a receipt was emailed unless you build that separately.
- No stored card data — Razorpay's Checkout widget handles all card/UPI entry; this backend
  never sees or stores card numbers, CVVs, or bank credentials, only the payment ID and
  signature Razorpay returns after the fact.
