import { useState, useEffect } from 'react';

const DB_NAME = 'GoogleCalendarApp';
const STORE_NAME = 'events';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export function useIndexedDB<T extends { id: string }>() {
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    openDB().then(setDb).catch(console.error);
  }, []);

  const saveToCache = async (items: T[]) => {
    if (!db) return;

    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      items.forEach((item) => store.put(item));

      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();
    });
  };

  const getFromCache = async (key: string): Promise<T | undefined> => {
    if (!db) return undefined;

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  };

  const getAllFromCache = async (): Promise<T[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  };

  const clearCache = async () => {
    if (!db) return;

    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      tx.oncomplete = () => resolve();
    });
  };

  return { saveToCache, getFromCache, getAllFromCache, clearCache };
}