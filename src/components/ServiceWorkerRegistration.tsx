"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register Service Worker for offline support
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(() => {
        console.log("Service Worker registered for offline support");
      }).catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
    }
  }, []);

  return null;
}
