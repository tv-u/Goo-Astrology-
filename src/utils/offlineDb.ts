import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface GooAstrologySchema extends DBSchema {
  kundlis: {
    key: string;
    value: {
      id: string;
      name: string;
      date: string;
      place: string;
      result: unknown;
      savedAt: string;
    };
  };
  panchangCache: {
    key: string;
    value: {
      cacheKey: string;
      result: unknown;
      cachedAt: string;
    };
  };
  datasets: {
    key: string;
    value: {
      datasetKey: string;
      version: string;
      checksumSha256: string;
      payload: unknown;
      syncedAt: string;
    };
  };
  familyCharts: {
    key: string;
    value: {
      id: string;
      relation: string;
      name: string;
      birthDate: string;
      birthTime: string;
      placeName: string;
      latitude: number;
      longitude: number;
      timezoneOffsetMinutes: number;
      lagna: string;
      moonSign: string;
      nakshatra: string;
      createdAt: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<GooAstrologySchema>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<GooAstrologySchema>('goo-astrology-offline-v2', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('kundlis')) {
          db.createObjectStore('kundlis', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('panchangCache')) {
          db.createObjectStore('panchangCache', { keyPath: 'cacheKey' });
        }
        if (!db.objectStoreNames.contains('datasets')) {
          db.createObjectStore('datasets', { keyPath: 'datasetKey' });
        }
        if (!db.objectStoreNames.contains('familyCharts')) {
          db.createObjectStore('familyCharts', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveKundliOffline(entry: {
  id: string;
  name: string;
  date: string;
  place: string;
  result: unknown;
}) {
  const db = await getDb();
  await db.put('kundlis', { ...entry, savedAt: new Date().toISOString() });
}

export async function listOfflineKundlis() {
  const db = await getDb();
  return db.getAll('kundlis');
}

export async function deleteOfflineKundli(id: string) {
  const db = await getDb();
  await db.delete('kundlis', id);
}

export async function saveFamilyMemberOffline(member: GooAstrologySchema['familyCharts']['value']) {
  const db = await getDb();
  await db.put('familyCharts', member);
}

export async function listFamilyMembersOffline() {
  const db = await getDb();
  return db.getAll('familyCharts');
}

export async function deleteFamilyMemberOffline(id: string) {
  const db = await getDb();
  await db.delete('familyCharts', id);
}

export async function cacheDatasetOffline(entry: GooAstrologySchema['datasets']['value']) {
  const db = await getDb();
  await db.put('datasets', entry);
}

export async function listOfflineDatasets() {
  const db = await getDb();
  return db.getAll('datasets');
}

export async function getOfflineStorageSummary() {
  const db = await getDb();
  const [kundlis, panchang, datasets, familyCharts] = await Promise.all([
    db.count('kundlis'),
    db.count('panchangCache'),
    db.count('datasets'),
    db.count('familyCharts'),
  ]);
  return { kundlis, panchang, datasets, familyCharts };
}

export async function clearAllOfflineStores() {
  const db = await getDb();
  await Promise.all([
    db.clear('kundlis'),
    db.clear('panchangCache'),
    db.clear('datasets'),
    db.clear('familyCharts'),
  ]);
}
