/**
 * Local-first storage.
 *
 * There is no server, no account and no network call anywhere in this codebase.
 * That is a design constraint, not a phase-one shortcut: this is among the most
 * sensitive categories of health data a person can generate, and a promise kept
 * in an architecture is worth more than one kept in a privacy policy. Anything
 * added later that uploads must be opt-in, end-to-end encrypted, and must not
 * be required for any feature here.
 */

import type { Alternative, Day, DateKey, SelfMessage, Settings } from '../core/types';
import { DEFAULT_SETTINGS } from '../core/types';

const DB_NAME = 'sobriety';
const DB_VERSION = 1;

const STORE_DAYS = 'days';
const STORE_ALTERNATIVES = 'alternatives';
const STORE_MESSAGES = 'messages';
const STORE_SETTINGS = 'settings';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_DAYS)) {
        db.createObjectStore(STORE_DAYS, { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains(STORE_ALTERNATIVES)) {
        db.createObjectStore(STORE_ALTERNATIVES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
        db.createObjectStore(STORE_MESSAGES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(
  storeName: string,
  mode: IDBTransactionMode,
  body: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const request = body(tx.objectStore(storeName));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        tx.oncomplete = () => db.close();
      }),
  );
}

export const days = {
  all: () => run<Day[]>(STORE_DAYS, 'readonly', (s) => s.getAll()),
  get: (date: DateKey) => run<Day | undefined>(STORE_DAYS, 'readonly', (s) => s.get(date)),
  put: (day: Day) => run<IDBValidKey>(STORE_DAYS, 'readwrite', (s) => s.put(day)),
};

export const alternatives = {
  all: () => run<Alternative[]>(STORE_ALTERNATIVES, 'readonly', (s) => s.getAll()),
  put: (a: Alternative) => run<IDBValidKey>(STORE_ALTERNATIVES, 'readwrite', (s) => s.put(a)),
  remove: (id: string) => run<undefined>(STORE_ALTERNATIVES, 'readwrite', (s) => s.delete(id)),
};

export const messages = {
  all: () => run<SelfMessage[]>(STORE_MESSAGES, 'readonly', (s) => s.getAll()),
  put: (m: SelfMessage) => run<IDBValidKey>(STORE_MESSAGES, 'readwrite', (s) => s.put(m)),
  remove: (id: string) => run<undefined>(STORE_MESSAGES, 'readwrite', (s) => s.delete(id)),
};

export const settings = {
  async get(): Promise<Settings> {
    const stored = await run<Settings | undefined>(STORE_SETTINGS, 'readonly', (s) =>
      s.get('settings'),
    );
    return { ...DEFAULT_SETTINGS, ...stored };
  },
  put: (value: Settings) =>
    run<IDBValidKey>(STORE_SETTINGS, 'readwrite', (s) => s.put(value, 'settings')),
};

export interface ExportBundle {
  version: 1;
  exportedAt: number;
  days: Day[];
  alternatives: Alternative[];
  /** Voice recordings are omitted: they are large, and they are the user's voice. */
  messages: Omit<SelfMessage, 'audio'>[];
  settings: Settings;
}

export async function exportAll(): Promise<ExportBundle> {
  const [d, a, m, s] = await Promise.all([
    days.all(),
    alternatives.all(),
    messages.all(),
    settings.get(),
  ]);
  return {
    version: 1,
    exportedAt: Date.now(),
    days: d,
    alternatives: a,
    messages: m.map(({ audio: _audio, ...rest }) => rest),
    settings: s,
  };
}

/**
 * Merge an exported bundle back in. Days are merged by date with the imported
 * copy winning, so restoring onto a device that has kept running does not
 * silently drop the days it recorded meanwhile.
 */
export async function importAll(bundle: ExportBundle): Promise<void> {
  if (bundle.version !== 1) throw new Error(`Tuntematon vientiversio: ${bundle.version}`);
  for (const day of bundle.days) await days.put(day);
  for (const a of bundle.alternatives) await alternatives.put(a);
  for (const m of bundle.messages) await messages.put(m as SelfMessage);
  await settings.put({ ...DEFAULT_SETTINGS, ...bundle.settings });
}

/** Irreversible, and offered plainly: leaving must be as easy as arriving. */
export async function eraseAll(): Promise<void> {
  const db = await open();
  db.close();
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}
