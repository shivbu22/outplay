import { eventBus, RealtimeEvent } from "@/lib/events";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;
  let heartbeatInterval: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      const connectPayload: RealtimeEvent = {
        id: "evt_init_" + Date.now(),
        type: "CONNECTED",
        timestamp: new Date().toISOString(),
        data: { message: "Connected to AMS Real-Time Event Bus" },
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(connectPayload)}\n\n`));

      // Subscribe to central event bus
      unsubscribe = eventBus.subscribe((event) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // Stream might be terminating
        }
      });

      // 15-second keep-alive heartbeats to prevent proxy/browser timeout
      heartbeatInterval = setInterval(() => {
        try {
          const heartbeat: RealtimeEvent = {
            id: "evt_hb_" + Date.now(),
            type: "HEARTBEAT",
            timestamp: new Date().toISOString(),
            data: { alive: true },
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(heartbeat)}\n\n`));
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
        }
      }, 15000);
    },
    cancel() {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data, tenantId } = body;
    if (!type) {
      return new Response(JSON.stringify({ error: "Missing event type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const event = eventBus.broadcast(type, data || {}, tenantId);
    return new Response(JSON.stringify({ success: true, event }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
