# SEO, Google Business Profile & Search Console

Getting found on Google has two separate pieces that work together: **your website's on-page SEO**
and **your Google Business Profile** (the map/business card that appears in local search results).
You need both — one doesn't substitute for the other.

## What's Already Implemented in the Code

- Unique `<title>` and meta description per page via the `SEO` component (`src/components/SEO.jsx`)
- Canonical URLs on every page
- Open Graph tags for social sharing previews
- Semantic heading structure (`h1` per page, `h2`/`h3` for sections)
- `alt` text fields on all images (populate these when uploading photos in the admin panel —
  describe what's actually in the photo, e.g. "Deluxe room with mountain-facing balcony")
- Lazy-loading (`loading="lazy"`) on gallery and room images
- `robots.txt` and a starter `sitemap.xml` in `frontend/public/`
- Mobile-first responsive layout (Tailwind breakpoints throughout)

## What You Need to Do Manually

### 1. Update placeholder URLs
Before launch, replace `https://www.example-homestay.com` in these files with your real domain:
- `frontend/index.html`
- `frontend/src/components/SEO.jsx`
- `frontend/public/robots.txt`
- `frontend/public/sitemap.xml`

### 2. Fill in real content
- Every room needs a genuine description (not generic filler) — Google rewards unique,
  specific content over templated text.
- Nearby-place distances must be accurate (drive from the property yourself, or use Google Maps
  driving directions) — do not estimate or invent them.
- Upload real, high-quality photos with descriptive alt text.

### 3. Structured Data (JSON-LD)
Add a `LodgingBusiness` schema block to `frontend/index.html` (or dynamically via the `SEO`
component) once real data is available:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "Mountain View Homestay",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Hilltop Road",
    "addressLocality": "Mussoorie",
    "addressRegion": "Uttarakhand",
    "postalCode": "248179",
    "addressCountry": "IN"
  },
  "telephone": "+919999999999",
  "priceRange": "₹1800–₹4000"
}
</script>
```

**Never fill in fake reviews, ratings, or availability** in structured data — Google penalizes
this, and it's misleading to customers. Only include fields you can back with real information.
Validate your JSON-LD with Google's Rich Results Test before publishing.

### 4. Image optimization
- Compress photos before uploading (aim under 300KB per image) — tools like Squoosh (web-based,
  free) or TinyPNG work well.
- Prefer WebP format where possible; Cloudinary (recommended for production image hosting, see
  `docs/DEPLOYMENT.md`) can auto-convert this for you.

---

## Google Business Profile — Step by Step

This is separate from your website and is often the *first* thing customers see in local search.

1. Go to **google.com/business** and sign in with the account you want to manage the listing.
2. Click **Add your business** → enter the homestay's exact legal/trading name.
3. Choose category: **"Bed & breakfast"** or **"Guest house"** (closest match for a homestay;
   avoid generic categories like "Lodging" if a more specific one fits).
4. Enter the **address** exactly as it should appear (match what's on your website — consistency
   matters for Google's trust signals).
5. Add **service area** if relevant, otherwise skip.
6. Add **phone number** and **website URL** (your live site once deployed).
7. **Verify** the business — Google will typically mail a postcard with a verification code to
   the property address (can take 1–2 weeks), or offer phone/email verification if eligible.
8. Once verified, complete the profile:
   - Add **10–20 high-quality photos** (exterior, rooms, common areas, food, views)
   - Write a clear **business description** (750 characters max) — mention key features and
     location honestly
   - Set **opening hours** / check-in-check-out times if applicable
   - Add **attributes** (Wi-Fi, parking, etc.) matching what you actually offer
9. Encourage genuine guests to leave reviews after their stay — **never buy or fake reviews**;
   Google actively detects and penalizes this, and it can get your listing suspended.
10. Keep information **consistent** everywhere (Google Business Profile, website, any directory
    listings) — mismatched addresses/phone numbers hurt local ranking.

## Google Search Console — Step by Step

1. Go to **search.google.com/search-console**.
2. Click **Add Property** → choose "URL prefix" and enter your live site URL
   (e.g. `https://www.yourhomestay.com`).
3. **Verify ownership** — easiest method is usually the HTML tag method (Search Console gives
   you a `<meta>` tag to paste into `frontend/index.html`'s `<head>`), or DNS verification via
   your domain registrar.
4. Once verified, go to **Sitemaps** in the left menu → submit `sitemap.xml`
   (e.g. `https://www.yourhomestay.com/sitemap.xml`).
5. Use **URL Inspection** to check whether individual pages (home, rooms, etc.) are indexed.
6. If a page isn't indexed yet, click **Request Indexing** from the inspection tool — this nudges
   Google to crawl it sooner (not guaranteed, but often helps for a new site).
7. Over the following weeks, check the **Performance** report to see:
   - Which search queries bring people to your site
   - Click-through rate and average position
8. Check **Coverage/Indexing** reports periodically for crawl errors (broken links, blocked
   pages) and fix them.

Indexing a brand-new site typically takes anywhere from a few days to a few weeks — this is
normal. Consistent, genuine content updates (new photos, accurate info) help over time. There is
no way to guarantee a specific Google ranking — be skeptical of anyone who claims otherwise.
