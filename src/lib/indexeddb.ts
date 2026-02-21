"use client";

const DB_NAME = "FleetFlow";
const DB_VERSION = 1;
const STORES = {
  vehicles: "vehicles",
  trips: "trips",
  drivers: "drivers",
  maintenance: "maintenance",
  expenses: "expenses",
  analytics: "analytics",
};

let db: IDBDatabase | null = null;

async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      Object.values(STORES).forEach((store) => {
        if (!database.objectStoreNames.contains(store)) {
          database.createObjectStore(store, { keyPath: "id" });
        }
      });
    };
  });
}

export async function saveToIndexedDB(
  storeName: keyof typeof STORES,
  data: any[]
): Promise<void> {
  const database = await initDB();
  const transaction = database.transaction([STORES[storeName]], "readwrite");
  const store = transaction.objectStore(STORES[storeName]);

  // Clear existing data
  await new Promise((resolve, reject) => {
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => resolve(null);
    clearRequest.onerror = () => reject(clearRequest.error);
  });

  // Add new data
  return new Promise((resolve, reject) => {
    data.forEach((item) => store.add(item));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getFromIndexedDB(
  storeName: keyof typeof STORES
): Promise<any[]> {
  const database = await initDB();
  const transaction = database.transaction([STORES[storeName]], "readonly");
  const store = transaction.objectStore(STORES[storeName]);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearIndexedDB(): Promise<void> {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(Object.values(STORES), "readwrite");
    Object.values(STORES).forEach((store) => {
      transaction.objectStore(store).clear();
    });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
