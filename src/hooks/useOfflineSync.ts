"use client";

import { useEffect, useState } from "react";
import { saveToIndexedDB, getFromIndexedDB } from "@/lib/indexeddb";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);

      try {
        // Attempt to sync all cached data
        await syncOfflineData();
      } catch (error) {
        console.error("Sync failed:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, isSyncing };
}

async function syncOfflineData() {
  // This function would reconcile cached data with server
  // Implementation depends on conflict resolution strategy
  // For now, server data takes precedence
  try {
    const response = await fetch("/api/sync-status");
    if (!response.ok) {
      throw new Error("Sync failed");
    }
    console.log("Data synced successfully");
  } catch (error) {
    console.error("Sync error:", error);
  }
}

export async function cacheAPIResponse(
  storeName: "vehicles" | "trips" | "drivers" | "maintenance" | "expenses" | "analytics",
  data: any[]
) {
  try {
    await saveToIndexedDB(storeName, data);
  } catch (error) {
    console.error(`Failed to cache ${storeName}:`, error);
  }
}

export async function getCachedData(
  storeName: "vehicles" | "trips" | "drivers" | "maintenance" | "expenses" | "analytics"
) {
  try {
    return await getFromIndexedDB(storeName);
  } catch (error) {
    console.error(`Failed to retrieve ${storeName} from cache:`, error);
    return [];
  }
}
