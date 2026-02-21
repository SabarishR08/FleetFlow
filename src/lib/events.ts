import { EventEmitter } from "events";

export type FleetEvent = {
  type: "trip:dispatched" | "trip:completed" | "trip:cancelled" | "vehicle:status" | "driver:status" | "maintenance:logged" | "expense:recorded";
  data: Record<string, any>;
  timestamp: number;
};

class EventManager extends EventEmitter {
  private readonly MAX_RETRIES = 100;

  emitFleetEvent(event: Omit<FleetEvent, "timestamp">) {
    this.emit("fleet-event", {
      ...event,
      timestamp: Date.now(),
    });
  }

  subscribeFleetEvents(callback: (event: FleetEvent) => void) {
    this.on("fleet-event", callback);
    return () => this.removeListener("fleet-event", callback);
  }
}

// Singleton instance
export const eventManager = new EventManager();
eventManager.setMaxListeners(100);
