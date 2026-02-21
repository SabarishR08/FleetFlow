import { NextRequest, NextResponse } from "next/server";
import { eventManager, FleetEvent } from "@/lib/events";

export function GET(request: NextRequest) {
  // Set up SSE response headers
  const responseHeaders = {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  };

  // Create a custom response that allows streaming
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Send initial connection message
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(":connected\n\n"));

      // Event listener callback
      const handleEvent = (event: FleetEvent) => {
        const message = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Subscribe to fleet events
      const unsubscribe = eventManager.subscribeFleetEvents(handleEvent);

      // Keep-alive interval
      const keepAliveInterval = setInterval(() => {
        controller.enqueue(encoder.encode(":keep-alive\n\n"));
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAliveInterval);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new NextResponse(stream, { headers: responseHeaders });
}
