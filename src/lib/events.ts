export type RealtimeEventType =
  | "CONNECTED"
  | "HEARTBEAT"
  | "CALL_STARTED"
  | "CALL_LOGGED"
  | "EMAIL_SENT"
  | "PROSPECT_REPLIED"
  | "METRIC_UPDATE"
  | "CADENCE_STEP_ADVANCED"
  | "ACTIVITY_CREATED"
  | "PROSPECT_CREATED";

export interface RealtimeEvent<T = any> {
  id: string;
  type: RealtimeEventType;
  timestamp: string;
  data: T;
  tenantId?: string;
}

type Listener = (event: RealtimeEvent) => void;

class RealtimeEventBus {
  private listeners: Set<Listener> = new Set();

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcast(type: RealtimeEventType, data: any = {}, tenantId?: string): RealtimeEvent {
    const event: RealtimeEvent = {
      id: "evt_" + Math.random().toString(36).substring(2, 9),
      type,
      timestamp: new Date().toISOString(),
      data,
      tenantId,
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in realtime event listener:", err);
      }
    }

    return event;
  }

  public get listenerCount(): number {
    return this.listeners.size;
  }
}

const globalForEvents = globalThis as unknown as {
  realtimeBus: RealtimeEventBus | undefined;
};

export const eventBus = globalForEvents.realtimeBus ?? new RealtimeEventBus();

if (process.env.NODE_ENV !== "production") {
  globalForEvents.realtimeBus = eventBus;
}
