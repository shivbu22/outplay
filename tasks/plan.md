# Real-Time Working Implementation Plan: AMS Live Engine

## Overview
Transform the AMS (Automated Multi-Channel Sales) platform from static polling into a **fully live, event-driven real-time sales engagement & telephony environment**. This plan establishes real-time Server-Sent Events (SSE) pub/sub streaming, live browser WebRTC & Web Audio API microphone processing with DTMF tone generation, an automated cadence execution background engine, and inbound webhook reply-detection.

---

## Architecture Decisions

1. **Event Streaming: Server-Sent Events (SSE) over WebSockets**
   - **Rationale:** Native to Next.js App Router route handlers (`ReadableStream` with `text/event-stream`), zero additional daemon dependencies (unlike raw WebSocket servers), resilient automatic browser reconnection, and fully compatible with multi-tab workspaces.
   - **Endpoint:** `/api/realtime/stream` + centralized in-memory pub/sub event bus (`src/lib/events.ts`).

2. **WebRTC Telephony: True Web Audio API & MediaStream Capture**
   - **Rationale:** Replaces static CSS mock animations with actual browser `navigator.mediaDevices.getUserMedia` microphone input, real-time frequency analysis via `AnalyserNode`, and dual-frequency DTMF audio synthesis (`OscillatorNode`) on dialpad clicks.
   - **Peer Loopback:** Simulates carrier ringback, connection latency, and bi-directional softphone states using native Web Audio.

3. **Cadence Automation: Event-Driven Cadence Execution Engine**
   - **Rationale:** A dedicated background runner (`src/lib/cadence-engine.ts` + `/api/cadence/tick`) that advances enrolled prospects through multi-channel steps (`EMAIL`, `CALL`, `SMS`, `LINKEDIN`), dispatches automated emails through mailbox rotation, populates dialer tasks, and streams live activity events.

4. **Inbound Reply Ingress & Auto-Pause**
   - **Rationale:** `/api/webhooks/inbound` endpoint parses inbound prospect replies, marks prospect as `REPLIED`, immediately halts cadence steps (`status: STOPPED_REPLY`), and pushes notifications to the Unified Inbox in real-time.

---

## Detailed Task Breakdown

### Phase 1: Real-Time Event Bus & SSE Streaming Foundation
- **Task RT-1.1: Build In-Memory Pub/Sub Event Bus**
  - **Description:** Implement `src/lib/events.ts` managing event subscriptions and broadcast channels (`ACTIVITY`, `DIALER`, `INBOX`, `METRICS`).
  - **Acceptance:**
    - Type-safe event payloads for `CALL_STARTED`, `CALL_LOGGED`, `EMAIL_SENT`, `PROSPECT_REPLIED`, `METRIC_UPDATE`.
    - `subscribe` and `broadcast` methods supporting multi-client fan-out.
  - **Verification:** Unit test dispatching 10 events to multiple listeners.
  - **Files:** `src/lib/events.ts`
  - **Scope:** Small (1 file)

- **Task RT-1.2: Implement SSE Streaming Route Handler**
  - **Description:** Create `/api/realtime/stream` returning `ReadableStream` with keep-alive heartbeats and automatic subscription to the event bus.
  - **Acceptance:**
    - Sends initial connection handshake `{ type: "CONNECTED", clientId }`.
    - Pushes heartbeats every 15s to keep connection alive.
    - Cleanly closes stream when client disconnects.
  - **Verification:** `curl -N http://localhost:3000/api/realtime/stream` receives connection event and heartbeats.
  - **Files:** `src/app/api/realtime/stream/route.ts`
  - **Scope:** Small (1 file)

- **Task RT-1.3: Build Client Real-Time Hook & Dashboard Shell Integration**
  - **Description:** Implement `src/hooks/use-realtime.ts` and integrate into `src/components/dashboard-shell.tsx` to automatically update application state on incoming events.
  - **Acceptance:**
    - Auto-reconnect with exponential backoff on disconnect.
    - Dispatches custom browser events or updates React state across all views.
  - **Verification:** Triggering an event via API reflects in the open browser without manual refresh.
  - **Files:** `src/hooks/use-realtime.ts`, `src/components/dashboard-shell.tsx`
  - **Scope:** Medium (2 files)

### Phase 2: Live Web Audio API & True WebRTC Softphone
- **Task RT-2.1: Implement Web Audio DTMF Keypad Tone Generator**
  - **Description:** Add standard dual-frequency DTMF tone generation (e.g. 1 = 697Hz + 1209Hz) when dialpad buttons are clicked in the softphone.
  - **Acceptance:**
    - Clicks on `0-9`, `*`, `#` produce distinct audible DTMF telephone tones using `OscillatorNode`.
    - Zero audio glitches or memory leaks (proper node disconnection).
  - **Verification:** Clicking dialpad generates correct acoustic tones in browser.
  - **Files:** `src/lib/dtmf.ts`, `src/components/dialer/softphone-widget.tsx`
  - **Scope:** Small (2 files)

- **Task RT-2.2: Implement Live Microphone Stream & Frequency Visualizer**
  - **Description:** Request real microphone access via `getUserMedia` and render live voice frequency bars using `AnalyserNode`.
  - **Acceptance:**
    - Speaking into microphone causes live waveform bars to react dynamically to user's volume.
    - Mute button immediately disconnects or mutes the audio track.
    - Gracefully falls back to simulated audio if microphone permission is denied.
  - **Verification:** Visualizer bars fluctuate in response to speech in softphone.
  - **Files:** `src/components/dialer/softphone-widget.tsx`
  - **Scope:** Medium (1 file)

### Phase 3: Automated Cadence Execution Engine & Auto-Pause
- **Task RT-3.1: Build Automated Cadence Progression Worker**
  - **Description:** Implement `src/lib/cadence-engine.ts` and `/api/cadence/tick` to advance prospects through sequence steps.
  - **Acceptance:**
    - Evaluates due enrollments based on `waitDays` and step order.
    - Automatically executes `EMAIL` step: increments mailbox send counter, logs `EMAIL_SENT` activity, broadcasts event.
    - Automatically executes `CALL` step: creates due `Task` in power dialer queue, broadcasts event.
  - **Verification:** Calling `/api/cadence/tick` advances 1 enrolled prospect to next step and creates corresponding dialer task.
  - **Files:** `src/lib/cadence-engine.ts`, `src/app/api/cadence/tick/route.ts`
  - **Scope:** Medium (2 files)

- **Task RT-3.2: Build Inbound Reply Webhook & Cadence Auto-Pause**
  - **Description:** Create `/api/webhooks/inbound` simulating incoming emails; updates prospect status to `REPLIED` and pauses active cadence.
  - **Acceptance:**
    - Updates `Prospect.status` to `REPLIED`.
    - Updates `SequenceEnrollment.status` to `STOPPED_REPLY`.
    - Creates `ActivityEvent` of type `EMAIL_REPLIED`.
    - Emits SSE event that adds conversation to Unified Inbox immediately.
  - **Verification:** POSTing sample email to `/api/webhooks/inbound` pauses prospect cadence and triggers live inbox update.
  - **Files:** `src/app/api/webhooks/inbound/route.ts`
  - **Scope:** Small (1 file)

### Phase 4: Live UI Stream & Activity Integration
- **Task RT-4.1: Wire Live Stream Feed on Dashboard**
  - **Description:** Update `src/app/page.tsx` activity stream and KPI cards to react in real-time to incoming SSE events.
  - **Acceptance:**
    - New activity cards animate in at the top of the stream without page reload.
    - Pipeline KPI counters (Emails Sent, Meetings Booked) increment live.
  - **Verification:** Emitting an event displays new activity row instantly in dashboard.
  - **Files:** `src/app/page.tsx`
  - **Scope:** Medium (1 file)

---

## Checkpoints & Verification Schedule

- **Checkpoint 1 (After Tasks RT-1.1 - RT-1.3):**
  - SSE connection opens on `http://localhost:3000/api/realtime/stream`.
  - Browser console logs active live event streaming connection with heartbeats.
- **Checkpoint 2 (After Tasks RT-2.1 - RT-2.2):**
  - Softphone produces audible DTMF tones on dialpad clicks.
  - Active call reacts to real microphone input with dynamic frequency bars.
- **Checkpoint 3 (After Tasks RT-3.1 - RT-3.2):**
  - Cadence tick advances step automatically.
  - Inbound webhook pauses sequence and broadcasts real-time reply alert.
- **Checkpoint 4 (After Task RT-4.1):**
  - Multi-tab synchronization verified: action in Tab 1 updates Tab 2 live.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
| :--- | :---: | :--- |
| **Microphone permission blocked by user** | Med | Provide immediate graceful fallback to procedural audio simulation so dialer never breaks. |
| **Server-Sent Events connection drop on network blip** | Med | Implement exponential backoff auto-reconnect logic in `useRealtime` hook with status indicator. |
| **Duplicate step execution in cadence engine** | High | Atomic database transactions checking `currentStepOrder` and locking enrollment state during execution. |
