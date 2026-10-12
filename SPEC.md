# Spec: AMS (Automated Multi-Channel Sales Platform)

## 1. Objective
Build **AMS** — a modern, white-labelable, high-performance sales engagement and automation platform that rebrands and leapfrogs Outplay.ai. 
AMS empowers outbound sales teams and growth agencies to prospect, run multi-channel cadences (Email, Phone, SMS, LinkedIn), execute power-dialing with WebRTC, and sync directly with enterprise CRMs, all wrapped in a sleek, fast, and unified dashboard.

### Core User Personas
1. **SDR / BDR (Sales Rep)**: Executes daily task queues, reviews prospect replies, dials contacts with 1-click WebRTC, and logs call dispositions.
2. **Sales Leader / Manager**: Designs sequences, manages mailbox rotation and daily throttles, monitors team leaderboards and conversion funnels.
3. **Agency Owner / Super Admin**: Manages multi-tenant workspaces with custom white-label branding (custom domain, logo, color palette).

---

## 2. Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14+ (App Router, TypeScript)** | High-speed SSR/RSC + client hydration, SEO for public landing & tools, unified API routes |
| **Styling & UI System** | **Tailwind CSS + Radix UI + Lucide** | Clean, dark/light luxury theme, accessible primitives, minimal runtime overhead |
| **Database & ORM** | **PostgreSQL + Prisma / Drizzle ORM** | ACID transactions, strict relational schemas, multi-tenant row-level isolation |
| **Queue & Cache** | **Redis + BullMQ** | Reliable distributed job queue for delayed sequence steps, email throttles & cron events |
| **Telephony / Softphone** | **Twilio Voice SDK (WebRTC)** | Browser-based click-to-dial, power dialing queue, call recordings, local presence |
| **Email Protocol & AI** | **OAuth 2.0 (Google/M365) + OpenAI/Claude SDK** | Native sending with inbox deliverability; dynamic AI sequence & personalized email generation |
| **Browser Extension** | **Manifest V3 (TypeScript / React)** | Client-side DOM overlay on LinkedIn & Gmail for 1-click scraping and cadence injection |

---

## 3. Commands

```bash
# Development
npm install
npm run dev

# Database
npx prisma generate
npx prisma db push
npx prisma studio

# Testing & Quality
npm run test           # Vitest unit & integration tests
npm run test:e2e       # Playwright E2E tests
npm run lint           # ESLint + Prettier check

# Production Build
npm run build
npm start
```

---

## 4. Project Structure

```
outplay/
├── apps/
│   ├── web/                     # Next.js main web app (Dashboard, Sequences, Dialer, Admin)
│   │   ├── app/                 # Next.js App Router (Dashboard, Cadences, Contacts, Dialer, Settings)
│   │   │   ├── (auth)/          # Login, Register, Invite, White-label SSO
│   │   │   ├── (dashboard)/     # Main protected app routes
│   │   │   │   ├── sequences/   # Sequence builder, steps, triggers
│   │   │   │   ├── prospects/   # Prospect directory, import, lists
│   │   │   │   ├── dialer/      # In-browser WebRTC softphone & call queue
│   │   │   │   ├── inbox/       # Unified inbox & email threads
│   │   │   │   └── analytics/   # Funnels, team activity, deliverability
│   │   │   └── api/             # REST / Webhook endpoints
│   │   ├── components/          # Reusable UI primitives and complex domain widgets
│   │   ├── lib/                 # Database clients, auth helpers, BullMQ queues
│   │   └── styles/              # Global CSS & Tailwind configuration
│   └── extension/               # Chrome Extension (Manifest V3) for LinkedIn/Gmail
├── packages/
│   ├── db/                      # Shared Prisma schema, migrations, and seed scripts
│   ├── queue/                   # Sequence worker logic & BullMQ consumers
│   └── telephony/               # Twilio WebRTC client and call disposition helpers
├── tasks/                       # Staged engineering plans & checklists
│   ├── plan.md
│   └── todo.md
├── CAPABILITY_MAP.md
└── SPEC.md
```

---

## 5. Code Style & Design Guidelines

* **TypeScript Strict Mode**: Zero `any` policy. All API request/response payloads validated via `zod`.
* **Tenant Isolation**: Every database query must filter by `tenantId`.
* **Component Architecture**: Compound component pattern with Radix UI and Tailwind.
* **Error Handling**: Standardized API error envelopes:
  ```json
  {
    "success": false,
    "error": {
      "code": "PROSPECT_ALREADY_ENROLLED",
      "message": "Prospect jane@acme.com is already active in sequence 'Enterprise Outbound'"
    }
  }
  ```

---

## 6. Boundaries (Governance Rules)

* **Always**:
  * Enforce tenant isolation on every database query.
  * Check email sending rate limits (max 50 emails/day per mailbox).
  * Automatically stop sequence progression if a prospect replies or meetings are booked.
  * Sanitize and validate all imported CSV columns.
* **Ask First**:
  * Modifying database migration schemas for live tables.
  * Adding external cloud providers or heavy third-party packages.
* **Never**:
  * Store unencrypted OAuth tokens or API keys.
  * Send cold emails without unsubscribed/opt-out headers.
  * Hardcode tenant credentials or secrets in source code.

---

## 7. Success Criteria & Verification

1. **Multi-Channel Cadence Flow**: A user can create a 4-step sequence (Day 1: AI Email -> Day 2: Call Task -> Day 4: Follow-up Email -> Day 6: LinkedIn Task), enroll 10 prospects, and observe automated queue scheduling.
2. **WebRTC Dialer Operability**: A rep can initiate a click-to-dial call directly from the browser, record the call, and tag the outcome with a disposition ("Meeting Booked").
3. **Inbox & Email Rotation**: Mail sends alternate dynamically across multiple configured mailboxes with open/click tracking.
4. **White-Label Customization**: Agency admins can configure a custom brand name, logo, and theme color that renders dynamically across client-facing login and portal pages.
