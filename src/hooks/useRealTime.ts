"use client";

import { useEffect, useRef, useCallback } from "react";
import { FleetEvent } from "@/lib/events";

type EventCallback = (event: FleetEvent) => void;

export function useRealTime(onEvent: EventCallback) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return;
    }

    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("message", (event) => {
      if (event.data === ":keep-alive") {
        return;
      }

      if (event.data === ":connected") {
        isConnectedRef.current = true;
        return;
      }

      try {
        const fleetEvent: FleetEvent = JSON.parse(event.data);
        onEvent(fleetEvent);
      } catch (error) {
        console.error("Failed to parse event:", error);
      }
    });

    eventSource.addEventListener("error", () => {
      isConnectedRef.current = false;
      eventSource.close();
      eventSourceRef.current = null;
      // Attempt reconnection after 3 seconds
      setTimeout(() => connect(), 3000);
    });

    eventSourceRef.current = eventSource;
  }, [onEvent]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected: isConnectedRef.current,
  };
}
