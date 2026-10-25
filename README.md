# Poster35 — Complete Poster Ordering Platform (₹35 Per Poster)

> **"Your Favourite Posters. Just ₹35."**  
> Premium e-commerce marketplace selling 300 GSM matte movie, football, cricket, celebrities, and music posters for a transparent fixed price of **₹35 per poster**.

---

## 1. Business Concept & Pricing Architecture

Every poster across all categories is sold for **₹35**. The pricing engine automatically calculates quantity multiples:

| Quantity | Subtotal Calculation | Delivery Fee | Grand Total | Savings / Perks |
|---|---|---|---|---|
| **1 Poster** | 1 × ₹35 = ₹35 | ₹49 | **₹84** | Standard packaging in rigid tube |
| **2 Posters** | 2 × ₹35 = ₹70 | ₹49 | **₹119** | Standard packaging in rigid tube |
| **3 Posters** | 3 × ₹35 = ₹105 | ₹49 | **₹154** | Standard packaging in rigid tube |
| **5 Posters** | 5 × ₹35 = ₹175 | **₹0 (FREE)** | **₹175** | **FREE All-India Delivery Unlocked** |
| **10 Posters**| 10 × ₹35 = ₹350 | **₹0 (FREE)** | **₹350** | **FREE All-India Delivery Unlocked** |

- **Subtotal Formula**: `Subtotal = Total Quantity × ₹35`
- **Free Delivery Threshold**: Orders of ₹175 or more (5+ posters) qualify for 100% Free Doorstep Delivery.
- **Server-Side Recalculation**: Prices and totals are recalculated on the server. Tampered or modified client prices are automatically rejected.
- **Configurable Pricing**: Default poster price, delivery fee, and free threshold can be edited anytime from the **Admin Dashboard**.

---

## 2. Poster Categories (Seeded with 216+ Real Posters)

The website is pre-populated with real photos directly from your workspace folders:

1. **CR7** — Cristiano Ronaldo iconic goals, Champions League celebrations, and portraits.
2. **Dhoni** — MS Dhoni 2011 World Cup finish, CSK Whistle Podu, and wicketkeeper masterclasses.
3. **English Movies** — Hollywood and world cinema masterpieces (*Interstellar*, *Oppenheimer*, *The Dark Knight*, *Pulp Fiction*, *Fight Club*).
4. **Messi** — Lionel Messi World Cup 2022 triumph, Ballon d'Or record, and Barcelona classics.
5. **Music Poster** — Legendary rock bands, pop titans, and composers (*Pink Floyd*, *Beatles*, *A.R. Rahman*, *Daft Punk*).
6. **Neymar** — Neymar Jr. Samba flair, Brazil Seleção, and PSG tricks.
7. **Tamil Movies** — Kollywood blockbusters (*Leo*, *Jailer*, *Vikram*, *Master*, *Baasha*, *Ponniyin Selvan*).
8. **Vijay** — Thalapathy Vijay mass elevations and cinematic portraits.
9. **Virat Kohli** — King Kohli 82* chase, century roars, and passion frames.
10. **Ajith & Anime** — Added and available in the categories collection.

---

## 3. Technology Stack

### Frontend:
- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS with custom Dark Cinematic Theme (`#07080b`, `#0c0e14`, `#171b26`), subtle glows, and glassmorphism.
- **Routing**: React Router DOM v7
- **Icons**: Lucide Icons
- **Effects**: Canvas Confetti celebratory order placement, 2:3 poster sheen hover animation.

### Backend (Production-Grade Dual Option):
1. **Node.js / Express API Server** (`backend/`):
   - Fast execution using built-in `node:sqlite` (`DatabaseSync`) for zero external dependencies.
   - JWT authentication & bcrypt password hashing.
   - Razorpay payment order generation & HMAC SHA-256 verification.
   - Multer poster file uploads and direct high-performance image serving with HTTP caching.
2. **Spring Boot 3 Enterprise API** (`backend-spring-boot/`):
   - Java 21, Spring Boot 3.3, Spring Data JPA / Hibernate, Spring Security, Bean Validation.
   - Relational entities with immutable order snapshots.
   - Dual database configuration: Embedded H2 for zero-config local dev, and managed PostgreSQL for production.

### Database:
- **Relational Schema**: `users`, `user_addresses`, `categories`, `posters`, `carts`, `cart_items`, `orders`, `order_items`, `payments`, `wishlists`, `store_settings`.
- **PostgreSQL DDL**: Fully defined in `database/schema.sql`.

---

## 4. Quick Start (Run Locally in 60 Seconds)

### Step 1: Install Dependencies
```bash
npm run install:all
```

### Step 2: Seed All 216 Posters into Database
```bash
cd backend
npx tsx src/seed.ts
cd ..
```

### Step 3: Start Dev Servers (Backend + Frontend concurrently)
```bash
npm run dev
```

The application will launch at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 5. Automated Tests

Run the built-in pricing rules, free delivery threshold, and HMAC SHA256 payment verification tests:

```bash
npm test
```

### Verified Test Cases:
1. `1 poster` = ₹35 + ₹49 shipping = ₹84
2. `2 posters` = ₹70 + ₹49 shipping = ₹119
3. `3 posters` = ₹105 + ₹49 shipping = ₹154
4. `5 posters` = ₹175 with **FREE shipping** = ₹175
5. `10 posters` = ₹350 with **FREE shipping** = ₹350
6. `Digital posters` = ₹0 shipping fee
7. `Razorpay HMAC SHA256` = authentic signatures verified, forged signatures rejected.

---

## 6. Default Login Credentials

### Administrator Portal (`/admin`):
- **Email**: `admin@poster35.com`
- **Password**: `Admin@12345`
- *Capabilities*: Dashboard stats, revenue analytics, poster image uploads, category creation, order status updates, courier tracking, and store pricing configuration.

### Demo Customer Account:
- **Email**: `customer@poster35.com`
- **Password**: `User@12345`
- *Note*: Guest checkout is also fully supported without registration.

---

## 7. REST API Documentation

### Public & Store Configuration:
- `GET /api/config` — Returns default poster price (₹35), delivery fee, thresholds, and store contact info.
- `GET /api/health` — Service health check.

### Categories:
- `GET /api/categories` — Returns all categories with poster count.
- `GET /api/categories/:slug` — Returns category details and its posters.

### Posters:
- `GET /api/posters?category={slug}&search={kw}&sort={popular|newest|alpha_asc|alpha_desc}&page={1}&limit={20}` — Paginated list of posters.
- `GET /api/posters/:idOrSlug` — Poster detail view + 4 related posters from the same category.
- `GET /api/posters/image/:category/:filename` — Securely serves high-resolution image with caching headers.

### Cart & Pricing:
- `POST /api/cart/calculate` — Accepts `{ items: [{ poster_id, quantity }], fulfilment_type }` and returns verified itemized breakdown with subtotal, shipping fee, and grand total.

### Checkout & Orders:
- `POST /api/orders/checkout` — Creates order with frozen title and price snapshots.
- `GET /api/orders/:id` — Fetches order summary, item snapshots, tracking, and downloadable receipt.
- `GET /api/orders/user/history` — Lists past orders for logged in user.

### Payment Integration:
- `POST /api/payments/create-order` — Initiates Razorpay payment order or realistic Test Mode order.
- `POST /api/payments/verify` — Verifies HMAC SHA-256 signature, records payment transaction, and updates order to `PAID`.
- `POST /api/payments/simulate-test-payment` — Realistic test payment generator for development checkouts.

### Admin (Protected with JWT + `role === 'ADMIN'`):
- `GET /api/admin/stats` — Revenue, orders, best sellers, category sales.
- `GET /api/admin/orders` — Filterable order list.
- `PUT /api/admin/orders/:id/status` — Update fulfilment status & tracking details.
- `POST /api/admin/posters` — Multipart file upload or image URL poster creation.
- `PUT /api/admin/posters/:id` — Edit poster details.
- `DELETE /api/admin/posters/:id` — Delete poster.
- `POST /api/admin/categories` — Add new category without changing code.
- `GET /api/admin/settings` & `PUT /api/admin/settings` — Update default ₹35 price, delivery fee, and thresholds.
