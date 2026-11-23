# Changelog

All notable changes to the **ElectroHaven** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.4.0] - 2026-11-23

### Added
- **AI Smart Setup Builder (`/build-setup`)**:
  - Interactive workspace builder supporting 6 primary disciplines: Gaming, Programming, Office, Video Editing, Content Creation, and Study.
  - Strict budget enforcement algorithm guaranteeing recommended bundles do not exceed user-specified budget ceilings.
  - Multi-tier recommendations: Smart Value (Budget), Recommended Sweet Spot (Balanced), and Peak Performance.
  - Live product swapping with instant cost recalculation and dynamic savings computation.
  - 1-Click "Add Entire Setup to Cart" bundling action with instant toast notifications.
  - Purpose-tailored hardware rationales explaining the specific engineering advantages of each component.
  - Dedicated automated verification suite (`scripts/test_setup_builder.js`) covering 116 test assertions.
- **Repository Preparation**:
  - Added comprehensive `README.md` with visual screenshot showcase and deployment guides.
  - Created `.gitignore` excluding build artifacts, dependencies, and environment files.
  - Created `.env.example` with documented environment options.
  - Added `CONTRIBUTING.md` and `CHANGELOG.md`.
  - Added automated headless screenshot capture suite (`scripts/capture_screenshots.js`).

### Fixed
- Fixed overlapping layout bug where `.sidebar-footer` (*"ElectroHaven Storefront / v2.4.0 · Pan-India"*) collided with `Cart` and `Orders` navigation buttons on medium viewport heights.

---

## [2.3.0] - 2026-11-22

### Added
- **Click & Collect (Store Pickup)**:
  - Added "Pick Up from Store (Free · 2 Hours)" fulfillment option on Product Details and Checkout pages.
  - Integrated 5 Ahmedabad flagship store locations (*Navrangpura Flagship, Satellite Experience Store, Maninagar Retail Hub, Vastrapur Mega Store, SG Highway Tech Hub*).
  - Real-time cart stock availability check disabling stores with insufficient inventory.
  - Automated generation of 4-digit pickup verification pass code (`EH-PASS-XXXX`).
  - Integrated Google Maps directions and customer pickup instructions.
  - Automated deduction of store-specific inventory upon pickup order placement and restoration upon cancellation.
  - Admin pickup order status progression: `Preparing` ➔ `Ready for Pickup` ➔ `Collected`.

---

## [2.2.0] - 2026-11-21

### Added
- **Visual Order Tracking & Cancellation**:
  - Croma-style visual milestone tracking timeline (`Order Placed`, `Confirmed`, `Packed`, `Shipped`, `Out for Delivery`, `Delivered`).
  - Interactive Air Waybill (AWB) copyable badge and courier dispatch details.
  - Customer self-service order cancellation modal with reason selection and confirmation warnings.
  - Automated inventory restoration restoring reserved stock upon order cancellation.
  - Admin status dropdown updating order milestones in real time.

---

## [2.1.0] - 2026-11-21

### Added
- **Real-Time Data Synchronization**:
  - Unified pub/sub layer using `BroadcastChannel` with `StorageEvent` cross-tab fallback.
  - Admin changes (products, prices, discounts, stock, offers, store details) update all open customer tabs without manual page reload.
  - Live cart price and stock synchronization.
- **Page Refresh & URL Router Fix**:
  - Client-side routing engine in `src/router.js` preserving exact page, product details, category filters, and search queries across browser reloads and Back/Forward history navigation.

---

## [2.0.0] - 2026-11-21

### Added
- **Comprehensive Admin Dashboard (`#/admin`)**:
  - KPI overview metrics: Total revenue, total orders, active users, catalog count, and low-stock warnings.
  - Complete Product CRUD with image URL updates, pricing, discounts, and category specifications.
  - Store Management: Add, edit, and update physical store details and coordinates.
  - Per-Store Inventory Matrix: Override stock quantities individually per store location.
  - Order Management: Filter orders by status and process shipments or cancellations.
  - User Management: View registered accounts, toggle suspension status, and enforce account bans.
  - Offers & Dynamic Coupons: Create custom promo codes (e.g. `FESTIVE30`) with minimum cart thresholds and expiry controls.
  - Role-based route guard redirecting non-admin users to the storefront.

---

## [1.5.0] - 2026-11-20

### Added
- **Cryptographic Authentication & User Accounts**:
  - Registration with full client-side input validation and password strength estimation.
  - PBKDF2 password derivation with HMAC-SHA256 and unique 16-byte random salts via browser WebCrypto API.
  - Sign-in with session tokens persisting across tab reloads.
  - Forgot password and 6-digit OTP verification flow.
  - Protected customer Profile page, order history, and saved address book.

---

## [1.2.0] - 2026-11-19

### Added
- **Persistent Cart & Checkout System**:
  - Add, remove, and adjust item quantities with instant recalculation.
  - Dynamic coupon discount application (`ELECTRO10`, `SAVE20`, `FESTIVE30`).
  - Checkout form validating contact information, shipping address, and delivery preferences.
  - Demo payment options: UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery.
  - Order confirmation screen displaying unique Order ID and summary.

---

## [1.1.0] - 2026-11-18

### Added
- **Real Electronics Catalog**:
  - Replaced all demo/fictional products with genuine electronics from Apple, Samsung, Sony, LG, HP, Dell, and Lenovo.
  - High-resolution authentic product photography stored locally in `public/products/`.
  - Pincode Delivery Checker with 6-digit Indian PIN delivery validation and estimated delivery dates.

---

## [1.0.0] - 2026-11-15

### Added
- Initial release of ElectroHaven.
- Responsive modern dark theme electronics storefront.
- Category filtering, product detail modals, and side-by-side product comparison engine.
