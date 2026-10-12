# AMS Implementation Task Tracker

## Phase 1: Foundation & Data Architecture
- [x] Task 1.1: Initialize Next.js 16+ project with TypeScript, Tailwind CSS, and Lucide Icons
  - Acceptance: Project builds and runs locally with clean modern theme.
  - Verify: `npm run build` succeeds without warnings.
  - Files: `package.json`, `app/layout.tsx`, `app/page.tsx`, `src/app/globals.css`
- [x] Task 1.2: Design and configure PostgreSQL/SQLite schema with Prisma ORM
  - Acceptance: Multi-tenant schemas defined for `Tenant`, `User`, `Prospect`, `Account`, `Sequence`, `SequenceStep`, `SequenceEnrollment`, `Mailbox`, `CallLog`, `Task`, `ActivityEvent`.
  - Verify: `npx prisma db push` ran cleanly, creating local `dev.db`.
  - Files: `prisma/schema.prisma`
- [x] Task 1.3: Create realistic database seeder for demo & testing
  - Acceptance: Populates sample tenant, reps, prospects, mailboxes, and pre-configured multi-channel sequences.
  - Verify: Database displays seeded data; seeded 1 Tenant, 2 Reps, 3 Accounts, 5 Prospects, 1 Sequence with 5 steps, tasks, call logs.
  - Files: `prisma/seed.ts`

## Phase 2: Multi-Tenant Auth & White-Label Shell
- [x] Task 2.1: Implement authentication system and multi-tenant isolation
  - Acceptance: Support tenant isolation filtering across all models by `tenantId`.
  - Files: `src/lib/db.ts`, `src/app/api/tenant/route.ts`
- [x] Task 2.2: Build dynamic White-Label & Theme customization engine
  - Acceptance: Admin can change brand name, select primary accent color, custom domain; UI updates instantly across app and sidebar.
  - Verify: Tested live preview and real-time state synchronization via `PATCH /api/tenant`.
  - Files: `src/components/dashboard-shell.tsx`, `src/app/settings/branding/page.tsx`

## Phase 3: Prospects & Accounts Engine
- [x] Task 3.1: Build Prospect & Account Directory data table
  - Acceptance: High-performance data table with search, status filters (Active, Replied, Bounced), and column customization.
  - Verify: Search across contacts with live status counts.
  - Files: `src/app/prospects/page.tsx`, `src/app/api/prospects/route.ts`
- [x] Task 3.2: Implement CSV Import wizard with column auto-mapping
  - Acceptance: Upload CSV, detect fields (Email, Phone, First Name, Company), check duplicates, and bulk-import.
  - Verify: Demo CSV import simulation populates contacts into database.
  - Files: `src/app/prospects/page.tsx`

## Phase 4: Multi-Channel Sequence Builder & Scheduler
- [x] Task 4.1: Build visual multi-channel cadence builder
  - Acceptance: Add, delete, and view steps: Automated Email, Phone Call Task, SMS, LinkedIn Touchpoint, or Manual Task with custom wait delays.
  - Verify: Step workflow tree displaying timing delays and content templates.
  - Files: `src/app/sequences/page.tsx`, `src/app/api/sequences/route.ts`
- [x] Task 4.2: Implement sequence enrollment and state machine
  - Acceptance: Enrolled prospects track active sequence step and status.
  - Files: `src/app/api/sequences/route.ts`, `prisma/schema.prisma`

## Phase 5: Inbox Mailer & AI Copy Generator
- [x] Task 5.1: Configure Mailbox manager with mailbox rotation
  - Acceptance: Connected mailboxes rotate automatically; health scores tracked.
  - Files: `src/components/sidebar.tsx`, `src/app/page.tsx`
- [x] Task 5.2: Implement AI Email & Sequence copy generator
  - Acceptance: Rep inputs target ICP and value proposition; AI generates personalized subject lines and multi-step copy with 1-click insertion.
  - Files: `src/app/sequences/page.tsx`

## Phase 6: In-Browser WebRTC Sales Dialer
- [x] Task 6.1: Build floating in-app WebRTC softphone interface
  - Acceptance: Dial pad, click-to-dial trigger on prospect phone numbers, mute, audio devices, call duration timer, waveform visualizer.
  - Verify: Softphone UI opens from topbar and prospect table rows, logs calls cleanly.
  - Files: `src/components/dialer/softphone-widget.tsx`
- [x] Task 6.2: Implement Power Dialer queue & disposition logger
  - Acceptance: Rep starts power dialer session; auto-dials next prospect on list; modal forces disposition (Interested, Voicemail Drop, Meeting Booked).
  - Verify: Disposition updates prospect status and advances sequence.
  - Files: `src/app/dialer/page.tsx`, `src/app/api/dialer/route.ts`

## Phase 7: Unified Inbox & Reply Intelligence
- [x] Task 7.1: Build unified multi-mailbox sales inbox
  - Acceptance: Live inbox aggregating replies across all mailboxes, grouped by prospect and thread; auto-pauses sequence on reply; AI rebuttal assistant.
  - Files: `src/app/inbox/page.tsx`

## Phase 8: AMS Connect Browser Extension
- [x] Task 8.1: Create Manifest V3 Chrome Extension prototype
  - Acceptance: Injects floating overlay on LinkedIn profile pages; scrapes name, company, title; 1-click enrolls into AMS sequence.
  - Files: `apps/extension/manifest.json`, `apps/extension/content-script.js`, `apps/extension/overlay.css`, `apps/extension/popup.html`

## Phase 9: Funnel Analytics & Polish
- [x] Task 9.1: Build sequence and team performance dashboard
  - Acceptance: Visual conversion funnel (Delivered -> Opened -> Replied -> Calls -> Meetings), SDR leaderboard, and domain deliverability scores.
  - Files: `src/app/analytics/page.tsx`, `src/app/api/analytics/route.ts`
