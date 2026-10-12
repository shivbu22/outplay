# AMS (Automated Multi-Channel Sales) Capability Map

> Rebranded, next-generation alternative to Outplay.ai: Unified Sales Engagement & Automation Platform.

## 1. System Decomposition

| Module ID | Responsibility | Depends On | Build Priority |
| :--- | :--- | :--- | :--- |
| **`ams-core-auth`** | Multi-tenant orgs, team seats, RBAC, session auth, white-label branding | — | P0 (Foundation) |
| **`ams-prospects-crm`** | Contact & Account management, CSV ingestion, deduplication, CRM sync (HubSpot/Salesforce) | `ams-core-auth` | P0 (Core Data) |
| **`ams-sequence-engine`** | Multi-channel sequence state machine, step transitions, scheduling, throttling | `ams-prospects-crm` | P0 (Core Engine) |
| **`ams-inbox-mailer`** | Mailbox rotation, IMAP/SMTP OAuth (Google/M365), AI email generator, open/click tracking | `ams-sequence-engine` | P1 (Outreach) |
| **`ams-web-dialer`** | WebRTC in-browser phone, call queue, dispositions, voicemail drop, recordings | `ams-sequence-engine` | P1 (Telephony) |
| **`ams-chrome-extension`** | Manifest V3 extension for LinkedIn/Gmail lead scraping & instant enrollment | `ams-prospects-crm`, `ams-sequence-engine` | P2 (Productivity) |
| **`ams-analytics`** | Step-by-step funnel metrics, deliverability monitoring, rep leaderboards, audit logs | `ams-inbox-mailer`, `ams-web-dialer` | P2 (Intelligence) |

---

## 2. Dependency Graph & Flow

```
ams-core-auth
     │
     ▼
ams-prospects-crm
     │
     ▼
ams-sequence-engine ──┬─────────────────────┐
     │                │                     │
     ▼                ▼                     ▼
ams-inbox-mailer   ams-web-dialer   ams-chrome-extension
     │                │
     └────────┬───────┘
              ▼
        ams-analytics
```

---

## 3. Boundary & Interface Contracts

1. **`ams-core-auth` → `ams-prospects-crm`**:
   * All queries enforce `tenantId` (multi-tenant isolation).
   * User role permissions (`admin`, `manager`, `rep`) govern data access rules.
2. **`ams-prospects-crm` → `ams-sequence-engine`**:
   * Prospects trigger state changes: `ACTIVE` → `REPLIED` / `BOUNCED` / `UNSUBSCRIBED` / `MEETING_BOOKED`.
   * Sequences consume standardized prospect entity `{ id, email, phone, customFields, timezone }`.
3. **`ams-sequence-engine` → Channel Workers**:
   * Publishes execution jobs onto Redis BullMQ queues (`email-queue`, `dialer-queue`, `sms-queue`, `manual-task-queue`).
4. **Channel Workers → `ams-analytics`**:
   * Emits immutable telemetry events `{ eventType, sequenceId, stepId, prospectId, repId, timestamp, metadata }`.
