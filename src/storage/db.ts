/**
 * Local-first storage.
 *
 * No server, no account, no network call anywhere in this codebase. That is an
 * architectural constraint rather than a first-phase shortcut: this is among the
 * most sensitive categories of data a person can generate, and a promise kept in
 * an architecture is worth more than one kept in a privacy policy.
 *
 * The database name is deliberately new. An earlier, quite different app shipped
 * from this repository under the name `sobriety`, and some devices still hold its
 * data. Reusing that name would have meant either reading records this schema
 * does not understand or migrating someone's history into a model it was never
 * recorded for. Leaving it untouched is the honest option — nothing here can
 * damage it.
 */

import type { Exposure } from '../core/rotation';
import type { CustomDemand, Episode, Settings, Supply } from '../core/types';
import { DEFAULT_SETTINGS } from '../core/types';

const DB_NAME = 'kymmenen-minuuttia';

/**
 * Bump this whenever a store is added below.
 *
 * v2 added `exposures`. Shipping that store without a version bump is exactly
 * what broke the app for everyone who had already opened it: `onupgradeneeded`
 * never fired, the store was missing, and the first read threw. `openWithStores`
 * now recovers from that class of mistake on its own, but the version is still
 * the correct place to declare the change.
 */
const DB_VERSION = 2;

const STORE_EPISODES = 'episodes';
const STORE_SUPPLIES = 'supplies';
const STORE_DEMANDS = 'demands';
const STORE_SETTINGS = 'settings';
const STORE_EXPOSURES = 'exposures';

/** Keyed stores, all with `id`. */
const KEYED_STORES = [STORE_EPISODES, STORE_SUPPLIES, STORE_DEMANDS, STORE_EXPOSURES];
const ALL_STORES = [...KEYED_STORES, STORE_SETTINGS];

function createMissingStores(db: IDBDatabase): void {
  for (const name of KEYED_STORES) {
    if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
  }
  if (!db.objectStoreNames.contains(STORE_SETTINGS)) db.createObjectStore(STORE_SETTINGS);
}

function openAt(version?: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = version === undefined ? indexedDB.open(DB_NAME) : indexedDB.open(DB_NAME, version);
    request.onupgradeneeded = () => createMissingStores(request.result);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Tietokanta on avoinna toisessa välilehdessä.'));
  });
}

/**
 * Open the database, repairing it if a store is missing.
 *
 * A version bump only creates stores for users whose stored version is lower.
 * If a release ever ships a new store without bumping — which has happened once
 * and cost every existing user a blank screen — the stored version already
 * equals the code's, no upgrade runs, and every read throws forever. So instead
 * of trusting the number, this checks the actual stores present and forces one
 * upgrade past whatever version is on disk when something is absent. Self-healing
 * beats remembering.
 */
function open(): Promise<IDBDatabase> {
  return openAt(DB_VERSION).then((db) => {
    const missing = ALL_STORES.filter((name) => !db.objectStoreNames.contains(name));
    if (missing.length === 0) return db;
    const next = db.version + 1;
    db.close();
    return openAt(next);
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

export const episodes = {
  all: () => run<Episode[]>(STORE_EPISODES, 'readonly', (s) => s.getAll()),
  put: (e: Episode) => run<IDBValidKey>(STORE_EPISODES, 'readwrite', (s) => s.put(e)),
};

export const supplies = {
  all: () => run<Supply[]>(STORE_SUPPLIES, 'readonly', (s) => s.getAll()),
  put: (v: Supply) => run<IDBValidKey>(STORE_SUPPLIES, 'readwrite', (s) => s.put(v)),
};

export const demands = {
  all: () => run<CustomDemand[]>(STORE_DEMANDS, 'readonly', (s) => s.getAll()),
  put: (d: CustomDemand) => run<IDBValidKey>(STORE_DEMANDS, 'readwrite', (s) => s.put(d)),
};

export const exposures = {
  all: () => run<Exposure[]>(STORE_EXPOSURES, 'readonly', (s) => s.getAll()),
  put: (e: Exposure) => run<IDBValidKey>(STORE_EXPOSURES, 'readwrite', (s) => s.put(e)),
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
  episodes: Episode[];
  supplies: Supply[];
  demands: CustomDemand[];
  exposures: Exposure[];
  settings: Settings;
}

export async function exportAll(): Promise<ExportBundle> {
  const [e, v, d, x, s] = await Promise.all([
    episodes.all(),
    supplies.all(),
    demands.all(),
    exposures.all(),
    settings.get(),
  ]);
  return {
    version: 1,
    exportedAt: Date.now(),
    episodes: e,
    supplies: v,
    demands: d,
    exposures: x,
    settings: s,
  };
}

/** Merge a bundle back in; the imported copy wins per record id. */
export async function importAll(bundle: ExportBundle): Promise<void> {
  if (bundle.version !== 1) throw new Error(`Tuntematon vientiversio: ${bundle.version}`);
  for (const e of bundle.episodes ?? []) await episodes.put(e);
  for (const v of bundle.supplies ?? []) await supplies.put(v);
  for (const d of bundle.demands ?? []) await demands.put(d);
  for (const x of bundle.exposures ?? []) await exposures.put(x);
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
