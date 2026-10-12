# UI-SPEC: AMS (Automated Multi-Channel Sales)
**Frontend Design Contract & Craft Specification**
**Operating Mode:** `Operate` (High-Density B2B Sales Engagement & Telephony Platform)
**Standard:** Enterprise Production Grade (Impeccable Craft & Anti-Vibecoded UI)

---

## 1. Design Direction & Visual Identity

### 1.1 Operating Mode Definition: `Operate`
AMS is an operational cockpit for SDRs, Account Executives, and RevOps leaders who spend 6 to 8 hours daily managing high-velocity multi-channel cadences. 
- **Core imperatives:** High information density, instant visual scanability, zero visual fatigue, tactile micro-feedback, and unambiguous data hierarchy.
- **Tone:** Technical, authoritative, razor-sharp, utilitarian. Avoid consumer SaaS playfulness, cartoonish iconography, and decorative filler.

### 1.2 Absolute Negative Constraints (Anti-Vibecoding Rules)
The following 30 tropes are strictly banned from all components and views:
1. **No decorative emojis:** Never use emojis in headings, status pills, cadence steps, buttons, or toasts (e.g., ban `🎉`, `🔥`, `✉️`, `📞`, `💬`, `⚡`, `📼`, `🛡️`). Statuses must use semantic text + micro dot indicators or custom SVGs.
2. **No purple-to-pink gradient text:** Avoid high-contrast linear gradient typography.
3. **No blurry radial orbs:** Never place oversized blurry background light blobs (`filter: blur(100px)`) behind cards or page headers.
4. **No oversized rounded pill corners:** Ban `rounded-2xl` and `rounded-3xl` on small badges, buttons, and form inputs. Use crisp structural `rounded-md` (6px) or `rounded-lg` (8px).
5. **No Lucide icon scattering:** Icons must serve functional navigation or action triggers only, with standardized 14px or 16px sizing and 1.5px/1.75px stroke weight.
6. **No unhandled loading states:** Ban centered spinning wheels; every data container must render explicit pulse/shimmer skeleton placeholders.
7. **No vague card grids:** Replace 3-card marketing grids with dense tabular layouts, split panels, or workflow trees.
8. **No neon cyberpunk glows:** Ban `box-shadow: 0 0 15px var(--accent)`. Use subtle 1px border borders (`rgba(255,255,255,0.08)`).
9. **No "It's not X, it's Y" copy:** Professional, direct sales and operations copywriting only.
10. **No checkmark bullet lists:** Use structured key-value tables and metric lists.

---

## 2. Token Architecture & Color Palette

### 2.1 Surfaces & Depth (High-Contrast Neutrality)
```css
:root {
  /* Canvas & Foundations */
  --ams-canvas: #070A11;           /* Deep obsidian base */
  --ams-surface-1: #0D1322;        /* Cards, panels, sidebar base */
  --ams-surface-2: #131C31;        /* Hover states, row highlights, inputs */
  --ams-surface-3: #1A2640;        /* Active toggles, elevated popovers */
  
  /* Borders & Dividers */
  --ams-border-subtle: #162035;    /* Default card borders */
  --ams-border-strong: #233352;    /* Interactive focused borders */
  --ams-border-focus: #3B82F6;     /* Keyboard focus ring */

  /* Text & Content */
  --ams-text-primary: #F8FAFC;      /* High-contrast headings and active values */
  --ams-text-secondary: #94A3B8;    /* Labels, descriptions, secondary copy */
  --ams-text-muted: #64748B;        /* Timestamps, helper text, placeholders */

  /* Accent & Functional Statuses (Desaturated, High-Legibility) */
  --ams-brand-primary: #3B82F6;     /* Cobalt Blue - Primary Action & Active State */
  --ams-brand-hover: #2563EB;
  
  --ams-status-active: #10B981;     /* Emerald - Enrolled, In-Progress, Active */
  --ams-status-booked: #0EA5E9;     /* Cyan - Meeting Booked, Converted */
  --ams-status-replied: #6366F1;    /* Indigo - Inbound Reply */
  --ams-status-warmup: #F59E0B;     /* Amber - Mailbox Warmup, Queued */
  --ams-status-bounced: #EF4444;    /* Crimson - Bounced, Dunning, Error */
}
```

### 2.2 Typography Scale & Tabular Numerals
- **Heading 1:** 20px / 1.25 leading, font-bold (700), tracking -0.02em.
- **Heading 2 / Section Title:** 14px / 1.3 leading, font-semibold (600), uppercase tracking +0.05em.
- **Body Regular:** 13px / 1.45 leading, font-normal (400), text-slate-300.
- **Labels & Micro-copy:** 11px / 1.3 leading, font-medium (500), text-slate-400.
- **Data & Telemetry:** 12px / 1.2 leading, font-mono (`tabular-nums`), font-semibold (600).

---

## 3. Component Specification & State Contracts

### 3.1 App Shell & Navigation
- **Sidebar (`w-60`):** Fixed left navigation with minimal brand mark, active route pill (`border-l-2 border-blue-500 bg-blue-500/10`), and real-time Mailbox Health meter (SPF/DKIM/DMARC status bar).
- **Topbar (`h-14`):** Global search bar (`Ctrl+K` shortcut hint), quick Softphone dialer dock trigger, quick Prospect capture button, and active SDR tenant indicator.
- **Accessibility:** Semantic `<aside>`, `<nav>`, `<header>`, and `<main>` landmarks.

### 3.2 Prospects Directory & Data Table (`/prospects`)
- **Density:** Compact table rows (`py-2.5 px-3.5`), sticky header with subtle border divider.
- **Columns:** Select Checkbox, Contact Name & Local Timezone, Company & Title, Contact (Email & Phone), Cadence & Step, Status Indicator, Instant Actions.
- **Status Indicator:** 
  - `MEETING_BOOKED`: Teal badge (`bg-sky-500/10 text-sky-400 border border-sky-500/20`) with SVG calendar icon.
  - `ACTIVE`: Emerald badge (`bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`) with micro pulse dot.
  - `REPLIED`: Indigo badge (`bg-indigo-500/10 text-indigo-400 border border-indigo-500/20`).
  - `UNENROLLED`: Neutral slate badge (`bg-slate-800 text-slate-400`).
- **Instant Actions:** Click-to-dial direct trigger (custom SVG phone), direct email trigger.

### 3.3 Visual Cadence Builder (`/sequences`)
- **Structure:** Split layout. Left pane displays cadence list with enrollment count and daily throttle limit; right pane displays the interactive step pipeline.
- **Step Node Card:** Clean card with step sequence index (`#1`, `#2`), channel icon (`Email`, `Phone`, `SMS`, `LinkedIn`), delay badge (`Wait 2 Days`), and preview snippet.
- **AI Copywriter Modal:** Clean input for buyer persona and core value proposition; generates realistic cold email copy with 1-click insertion into the step editor.

### 3.4 WebRTC Sales Dialer & Softphone (`/dialer` & Widget)
- **Docked Softphone Widget:** Fixed bottom-right docked widget (`w-80`).
- **Idle State:** Number input, 3x4 tactile dialpad buttons (`h-10 rounded-md bg-surface-2 hover:bg-surface-3`), and primary "Start Call via WebRTC" trigger.
- **Active Call State:** Real-time call duration timer (`mm:ss`), live audio frequency bar visualizer (SVG), mute/unmute toggle, 1-click "Voicemail Drop" trigger, and instant hangup button.
- **Disposition Logger State:** Prompted immediately upon hangup. Select disposition dropdown (`Meeting Booked`, `Interested`, `Left Voicemail`, `No Answer`, `Gatekeeper`, `Not Interested`), call notes textarea, and "Save Outcome & Next" button.

### 3.5 Unified Multi-Mailbox Inbox (`/inbox`)
- **Two-Column Viewport:** Left column (`w-80`) with thread list, unread indicators, and sentiment badges (`Interested`, `Out of Office`, `Objection`); Right column displays message thread history and quick reply composer.
- **Cadence Safety:** Displays prominent notice: `Sequence paused automatically upon reply` to ensure prospects are not double-contacted.

### 3.6 Funnel Analytics & Leaderboard (`/analytics`)
- **Metrics:** Total Prospects, Emails Sent & Delivered, Open Rate %, Reply Rate %, Calls Connected %, Meetings Booked.
- **Funnel Visualization:** Proportional horizontal step bars showing step-by-step conversion drop-offs.
- **Rep Leaderboard:** Ranked list of SDRs with quota attainment percentages and activity counts.

---

## 4. State Management, Skeletons & Transitions

| View / Action | Idle State | Loading / Async State | Empty State | Error State |
| :--- | :--- | :--- | :--- | :--- |
| **Prospects Table** | Filtered row list | 5-row pulse skeleton with shimmering gray bars | "No prospects match filter" + "Add Prospect" button | Red alert banner with "Retry" |
| **Cadence Steps** | Visual node pipeline | 3-card skeleton tree | "No steps in this cadence" + "Add Step" button | Warning banner with error details |
| **Softphone** | Ready dialpad | Pulsing connecting wave (`Connecting...`) | "Enter phone number to dial" | Call failure alert with retry option |
| **Inbox** | Conversation list | Skeleton message cards | "No replies in queue" | Disconnected mailbox notification |

---

## 5. Verification & Acceptance Criteria
1. **Zero Vibecoding Tropes:** Clean audit confirming no emojis, no harsh gradients, no blur orbs, and no default pill buttons.
2. **Build Cleanliness:** `npm run build` compiles with 0 errors and 0 type-check failures.
3. **Responsive Operability:** Fully operable on 1280px+ desktop dashboards with crisp scaling down to tablet viewports.
