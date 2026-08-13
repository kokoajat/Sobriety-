/**
 * Copy the Vite build into the repository root.
 *
 * GitHub Pages is configured to publish this branch's root directory verbatim,
 * and that setting cannot be changed from here. So the root has to *be* the
 * built site: index.html plus assets/, committed. The Vite entry template lives
 * at app.html precisely so that it never occupies the published index.html.
 *
 * Run via `npm run build` — never by hand, or the committed build drifts from
 * the source it claims to be built from. CI re-runs this and fails if the
 * result differs from what is committed.
 */

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(repoRoot, 'dist');

// The build emits app.html because that is the entry's name; the published site
// needs it at index.html. Asset URLs inside it are relative, so renaming is safe.
const html = await readFile(join(dist, 'app.html'), 'utf8');

// Wipe first: asset filenames are content-hashed, so without this every build
// would leave its predecessors behind in git forever.
await rm(join(repoRoot, 'assets'), { recursive: true, force: true });
await mkdir(join(repoRoot, 'assets'), { recursive: true });
await cp(join(dist, 'assets'), join(repoRoot, 'assets'), { recursive: true });

await writeFile(join(repoRoot, 'index.html'), html);

// Jekyll runs by default on branch-published sites and would drop any file
// beginning with an underscore. Vite does not currently emit such names, but
// this costs nothing and removes a whole category of silent breakage.
await writeFile(join(repoRoot, '.nojekyll'), '');

// Keep `vite preview` usable: it serves dist/ and would 404 on / otherwise.
await writeFile(join(dist, 'index.html'), html);

console.log('Synced build to repository root (index.html, assets/).');
