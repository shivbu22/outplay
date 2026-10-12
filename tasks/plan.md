# Implementation Plan: AMS (Automated Multi-Channel Sales)

## Phase Breakdown & Milestone Roadmap

```
PHASE 1 (Architecture & Data Layer)
   │
   ▼
PHASE 2 (Multi-Tenant Auth & Workspace Branding)
   │
   ▼
PHASE 3 (Prospects Directory & CRM Sync)
   │
   ▼
PHASE 4 (Visual Sequence Engine & Scheduler)
   │
   ▼
PHASE 5 (Mailbox Rotation & AI Email Engine)
   │
   ▼
PHASE 6 (WebRTC Sales Dialer & Telephony)
   │
   ▼
PHASE 7 (Unified Inbox & Reply Detection)
   │
   ▼
PHASE 8 (Outplay Connect Chrome Extension)
   │
   ▼
PHASE 9 (Funnels, Analytics & Launch Polish)
```

---

### Milestone 1: Monorepo Foundation & Core Data Model
* **Goal**: Initialize Next.js project with Tailwind CSS, Prisma ORM, and PostgreSQL schema.
* **Deliverables**:
  * Multi-tenant relational schema: `Tenant`, `User`, `Prospect`, `Account`, `Sequence`, `SequenceStep`, `SequenceEnrollment`, `Mailbox`, `CallLog`, `ActivityEvent`.
  * Database seed script with realistic demo data.

### Milestone 2: Multi-Tenant Authentication & Custom Branding
* **Goal**: Secure login/signup with dynamic white-label brand injection.
* **Deliverables**:
  * NextAuth / JWT session authentication with role checks (`Admin`, `Manager`, `Rep`).
  * Dynamic theme/branding provider injecting custom logo, brand color, and portal title.

### Milestone 3: Prospects & Accounts Management
* **Goal**: Enterprise contact directory with bulk operations.
* **Deliverables**:
  * Filterable, sortable data table for prospects and company accounts.
  * CSV batch uploader with column auto-mapping and duplicate prevention.
  * Tagging, custom field attributes, and status management.

### Milestone 4: Multi-Channel Sequence Engine
* **Goal**: The core scheduling heart of AMS.
* **Deliverables**:
  * Drag-and-drop or visual linear sequence builder (Email, Call, SMS, LinkedIn, Task).
  * BullMQ job scheduler handling step wait-delays, work-hour timezone windows, and weekend skips.
  * Automatic sequence pause triggers on reply or bounce.

### Milestone 5: Inbox Mailer & AI Copy Generator
* **Goal**: High-deliverability sending & AI assistance.
* **Deliverables**:
  * Mailbox connection (Google Workspace / M365 OAuth or standard SMTP).
  * Mailbox rotation algorithm (distributing 200 emails across 4 mailboxes evenly).
  * Built-in AI cold email generator with customizable tone, value proposition, and variables.

### Milestone 6: In-Browser WebRTC Sales Dialer
* **Goal**: Softphone calling capabilities directly inside the app.
* **Deliverables**:
  * Twilio Voice SDK / WebRTC audio integration with keypad, mute, and hang-up controls.
  * Power dialer queue mode (automatically fetching the next prospect call task).
  * Call disposition modal (Interested, Voicemail Drop, Bad Number) with auto-notes.

### Milestone 7: Unified Sales Inbox
* **Goal**: Centralized communication stream.
* **Deliverables**:
  * Two-way thread viewer for prospect replies across all connected mailboxes.
  * 1-click sentiment analysis and automatic sequence completion.

### Milestone 8: AMS Connect Chrome Extension
* **Goal**: Prospecting directly on LinkedIn and Gmail.
* **Deliverables**:
  * Manifest V3 extension with floating drawer.
  * DOM parser extracting contact details from LinkedIn profiles.
  * 1-click "Add to AMS Sequence" workflow.

### Milestone 9: Funnel Analytics & Production Readiness
* **Goal**: Visual dashboards and end-to-end verification.
* **Deliverables**:
  * Sequence open rate, click rate, reply rate, call connect rate metrics.
  * Rep activity leaderboard.
  * End-to-end automated tests and production deployment configuration.
