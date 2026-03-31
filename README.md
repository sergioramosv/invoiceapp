# InvoiceApp

**Professional invoicing for freelancers and businesses — open source, built with Next.js and Firebase.**

Create beautiful invoices and quotes, export them as PDF, manage your clients, and stay compliant with Spanish electronic invoicing law (VeriFactu). Live demo included, no account needed.

🌐 **Live:** [invoiceapp.es](https://www.invoiceapp.es/) &nbsp;·&nbsp; 🚀 **Try the demo:** [invoiceapp.es/demo](https://www.invoiceapp.es/demo)

---

## Features

### Document Editor
- **Real-time WYSIWYG** — split-screen editor with a live A4 preview as you type
- **4 template styles** — Classic, Minimal, Corporate, Creative
- **Invoices and quotes** — convert a quote to an invoice with one click
- **Smart auto-numbering** — sequences per year, fully customizable
- **Signature and stamp** — draw by hand or upload an image, appears in the PDF
- **Custom fields** — add any extra field to the sender/recipient/footer sections
- **Bank details block** — IBAN, BIC/SWIFT, routing number
- **Shipping address** — toggle on/off per document
- **Logo upload** — appears in the header of every document

### PDF & Export
- **One-click PDF** — pixel-perfect A4 export via jsPDF + html-to-image
- **CSV export** — dump your full invoice list to a spreadsheet in one click
- **PNG export** — export any invoice as a high-res image

### VeriFactu (Spanish Electronic Invoicing)
> Compliant with **Real Decreto 1007/2023** and **Orden HAC/1177/2024**

- **SHA-256 hash chain** — every invoice is cryptographically linked to the previous one, guaranteeing immutability
- **AEAT XML/SOAP** — automatic submission to Spain's tax authority web service
- **QR code on every invoice** — lets the recipient verify the invoice directly with Hacienda
- **Invoice types** — F1, F2, R1–R5 (rectificativas) all supported
- **VAT breakdown per rate** — 21%, 10%, 4%, exempt — each as a separate line
- **Emit vs draft** — explicit "Emit" step locks the invoice and sends it to the AEAT
- **Status tracking** — pending → emitting → accepted / rejected, visible on the dashboard
- **Race condition protection** — two-phase transaction locks the invoice before the AEAT call

### Client Management
- Full client directory with name, email, address, tax ID, phone
- Client history — see all invoices and quotes for each client
- Auto-fill form fields when selecting an existing client

### Dashboard & Analytics
- Revenue chart (monthly, last 12 months)
- KPIs: total revenue, outstanding, paid, overdue
- Invoice status distribution
- Top clients by revenue

### i18n & Multi-currency
- **Languages**: Spanish, English, German (UI + document content)
- **20+ currencies**: EUR, USD, GBP, JPY, MXN, ARS, and more
- Language persisted per user in Firestore

### Public REST API
Integrate InvoiceApp with any external system using your personal API key.

```http
GET  /api/v1/invoices         # List all invoices
GET  /api/v1/invoices/:id     # Get a single invoice
GET  /api/v1/clients          # List all clients
```

Authentication via `x-api-key` header or `Authorization: Bearer <key>`.

### Demo Mode
- Full sandbox at `/demo` — no account or login required
- All pages work: invoices, quotes, clients, templates, settings
- PDF export includes a diagonal watermark

### PWA
- Installable on desktop and mobile
- Works offline — create and edit documents without internet

### Other
- **Dark mode** — full dark/light theme, persisted per user
- **Ctrl+K / Cmd+K** command palette — jump to any page or search invoices
- **Error boundaries** — graceful fallback on unexpected errors
- **Transactional emails** — welcome email and payment confirmation via Resend

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Auth & DB | Firebase Auth + Firestore |
| Styling | Tailwind CSS v4 |
| PDF | jsPDF + html-to-image |
| Email | Resend |
| Testing | Vitest + Playwright |
| PWA | Next.js manifest + Service Worker |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/sergioramosv/invoiceapp.git
cd invoiceapp
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the root:

```env
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Email
RESEND_API_KEY=

# VeriFactu (optional — stub mode works without these)
VERIFACTU_LIVE=false                    # Set to true to send to AEAT staging
VERIFACTU_CERT_PATH=./certs/cert.p12   # Path to your .p12 digital certificate
VERIFACTU_CERT_PASSWORD=               # Password for the .p12 certificate
VERIFACTU_URL=                         # Override AEAT endpoint (default: staging)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The demo at `/demo` works without any configuration.

---

## Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm test             # Unit tests (Vitest)
npm run test:run     # Unit tests (no watch)
npm run test:e2e     # End-to-end tests (Playwright)
```

---

## Project Structure

```
src/
├── app/
│   ├── (marketing)/     # Landing page
│   ├── (auth)/          # Login, signup
│   ├── (app)/workspace/ # Main app (invoices, clients, dashboard...)
│   ├── (demo)/          # Sandboxed demo (no auth)
│   └── api/             # API routes (REST API, VeriFactu, webhooks)
├── components/
│   ├── invoice/         # InvoiceForm, InvoicePreview, SignaturePad
│   └── ui/              # Shared UI components
├── hooks/               # useInvoice, useClients, useSearch...
├── lib/                 # Firebase, VeriFactu, PDF, emails, Stripe...
└── types/               # TypeScript types
```

---

## VeriFactu Setup

To enable AEAT submission you need:

1. A digital certificate (FNMT or representative certificate) for your company
2. Register as a software manufacturer with the AEAT (declaración responsable)
3. Set the certificate path and password in `.env.local`
4. Test against the AEAT staging environment before going live

See [`VERIFACTU.md`](./VERIFACTU.md) for the full technical spec and implementation details.

---

## Custom Development

Want something more advanced? Need a tailored invoicing system, custom integrations, or a full SaaS built from scratch?

I'm available for freelance work — reach out at **sergioramosvicente2004@gmail.com** or visit **[sergioramosvicente.com](https://sergioramosvicente.com)**

---

## License

MIT — use it, fork it, deploy your own instance.
