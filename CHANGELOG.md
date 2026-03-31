# Changelog

All notable changes to InvoiceApp are documented here.

## [0.8.0] — 2026-03-31

### Added
- **VeriFactu system** — Hash chain SHA-256, XML SOAP builder, AEAT client, QR code on invoices, invoice type selector (F1/F2/R1...), VAT breakdown per rate, emit vs draft flow, send status tracking (pending/sent/accepted/rejected)
- Free launch mode — no watermark, no Stripe required, early adopters get permanent benefits
- Ctrl+K / Cmd+K command palette with quick search and preview
- CSV export for invoices
- Error boundaries and loading skeletons throughout the app

### Fixed
- Route corrections across app
- Dynamic hint for keyboard shortcut (Ctrl+K / Cmd+K based on OS)
- Legal pages: responsible party set to Sergio Ramos Vicente, SRSoftware removed
- Email addresses updated to sergioramosvicente2004@gmail.com

---

## [0.7.0] — 2026-03-24

### Added
- Client management — full CRUD, client history, linked to invoices
- Offline support (PWA)
- Public API (invoice data endpoint)
- Smart auto-numbering for invoices

### Fixed
- Next.js updated to 16.2.1 (CVE-2025-66478)
- Firebase Admin lazy init — no crash without env vars
- Language persisted in Firestore, provider order, dark mode thumbnails
- Removed duplicate i18n keys in nav.clients (ES/EN)
- CSS variables using `--color-` prefix in clientHistory module
- Removed max-width from all pages, full-width layout enforced

---

## [0.6.0] — 2026-03-17

### Added
- Full i18n ES/EN — dictionaries, context provider, language selector across the whole app
- Editable label below the signature (signatureLabel)
- Signature/stamp — draw by hand or upload image, visible in preview and PDF

### Fixed
- PDF from dashboard no longer blank (removed opacity:0, added white background)

---

## [0.5.0] — 2026-03-10

### Added
- SVG logos (black/white variants), favicon, PWA icons, logo in navbar/sidebar
- Custom modals replacing all native alert/confirm/prompt dialogs
- Independent templates — template selector when creating a document
- A4 real-scale preview panel

### Fixed
- `crypto.randomUUID` replaced with `uid()` for HTTP (non-HTTPS) compatibility
- New template/document no longer stays loading
- Sign out redirects to landing page
- Dashboard: full width, simplified stats, status selector
- Full dark mode — buttons, badges, cards, inputs, landing, sidebar
- Editor: h-screen layout, no padding on main, buttons always visible
- Sidebar: sticky h-screen, sign-out button always visible
- Logo visible in preview
- Mobile nav: exit button visible without opening menu
- Background colors restored (bg-white / bg-black / transparent)
- A4 folio renders white without clipping
- html2canvas replaced with html-to-image (oklab color support)
- Tailwind v4 oklab colors removed with theme reset

---

## [0.4.0] — 2026-03-03

### Added
- Sprint 7 — Dark mode, templates, PNG export, PWA, dashboard stats, auto-numbering
- Premium B&W redesign, PDF generation from dashboard, quote-to-invoice conversion
- Logo upload, quote/budget document support
- Unit tests and E2E tests (Vitest + Playwright)

---

## [0.3.0] — 2026-02-24

### Added
- Sprint 6 — Legal pages (TOS, Privacy, FAQ), SEO meta tags, analytics
- Legal disclaimer: InvoiceApp is not fiscal management software (TOS, footer, FAQ)
- FAQ entry #6 — fiscal disclaimer in ES/EN

---

## [0.2.0] — 2026-02-17

### Added
- Sprint 5 — Stripe integration, transactional emails, plan upgrade flow
- Sprint 4 — Full landing page
- Sprint 3 — PDF generation, template system, dashboard, sidebar navigation
