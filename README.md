# InvoiceApp

A full-stack invoicing and document design app built with Next.js, Firebase, and TypeScript. Portfolio project.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth & DB**: Firebase (Auth + Firestore)
- **Styling**: Tailwind CSS v4
- **PDF**: jsPDF + html-to-image
- **Email**: Resend
- **Testing**: Vitest + Playwright
- **PWA**: Service Worker, offline support

## Features

- Create and manage invoices and quotes
- PDF export with live A4 preview
- Client management with history
- Dark/light mode
- Full i18n (ES / EN)
- Signature/stamp — draw or upload
- Smart auto-numbering
- CSV export
- Ctrl+K / Cmd+K command palette
- Templates
- VeriFactu system (hash chain SHA-256, AEAT XML, QR code)
- Public REST API
- PWA — installable, works offline

## Getting Started

```bash
npm install
npm run dev
```

Create a `.env.local` with your Firebase credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
RESEND_API_KEY=
```

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm test             # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
```

## License

MIT
