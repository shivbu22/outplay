"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { RealtimeEvent } from "@/lib/events";

export type ConnectionStatus = "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "ERROR";

export function useRealtime(onEvent?: (event: RealtimeEvent) => void) {
  const [status, setStatus] = useState<ConnectionStatus>("CONNECTING");
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backoffRef = useRef<number>(1000);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStatus("CONNECTING");

    try {
      const es = new EventSource("/api/realtime/stream");
      eventSourceRef.current = es;

      es.onopen = () => {
        setStatus("CONNECTED");
        backoffRef.current = 1000; // Reset exponential backoff
      };

      es.onmessage = (message) => {
        try {
          const parsed: RealtimeEvent = JSON.parse(message.data);
          setLastEvent(parsed);

          if (onEvent) {
            onEvent(parsed);
          }

          // Broadcast globally to window listeners
          window.dispatchEvent(
            new CustomEvent("ams:realtime", { detail: parsed })
          );

          if (parsed.type) {
            window.dispatchEvent(
              new CustomEvent(`ams:${parsed.type.toLowerCase()}`, {
                detail: parsed.data,
              })
            );
          }
        } catch (e) {
          console.error("Failed to parse SSE payload:", e);
        }
      };

      es.onerror = () => {
        setStatus("DISCONNECTED");
        es.close();
        eventSourceRef.current = null;

        // Schedule reconnect with exponential backoff (capped at 10s)
        const delay = Math.min(backoffRef.current, 10000);
        backoffRef.current *= 1.5;

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
    } catch (err) {
      console.error("Failed to initialize EventSource:", err);
      setStatus("ERROR");
    }
  }, [onEvent]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  return {
    status,
    lastEvent,
    reconnect: connect,
  };
}
