// Mirrors .claude/skills (source of truth, read by Claude Code) to .agents/skills (read by Codex).
// Usage: node scripts/sync-skills.mjs          copy changes, remove files that no longer exist in the source
//        node scripts/sync-skills.mjs --check  only report differences, exit 1 when out of sync
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(import.meta.dirname, '..');
const source = join(root, '.claude', 'skills');
const target = join(root, '.agents', 'skills');
const check = process.argv.includes('--check');

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true })
    .filter((path) => statSync(join(dir, path)).isFile() && !path.endsWith('.DS_Store'))
    .sort();
}

const sourceFiles = listFiles(source);
const targetFiles = new Set(listFiles(target));

const changed = sourceFiles.filter((path) =>
  !targetFiles.has(path) || !readFileSync(join(source, path)).equals(readFileSync(join(target, path))));
const removed = [...targetFiles].filter((path) => !sourceFiles.includes(path));

if (changed.length === 0 && removed.length === 0) {
  console.log(`Skills in sync (${sourceFiles.length} files).`);
  process.exit(0);
}

for (const path of changed) console.log(`${(check ? 'differs' : 'copy').padEnd(8)}${path}`);
for (const path of removed) console.log(`${(check ? 'extra' : 'remove').padEnd(8)}${path}`);

if (check) {
  console.error(`\n${relative(root, target)} is out of sync with ${relative(root, source)}. Run: npm run skills:sync`);
  process.exit(1);
}

for (const path of changed) cpSync(join(source, path), join(target, path));
for (const path of removed) rmSync(join(target, path));
// Drop directories left empty by removals, deepest first.
const dirs = readdirSync(target, { recursive: true })
  .map((path) => join(target, path))
  .filter((path) => statSync(path).isDirectory())
  .sort((a, b) => b.length - a.length);
for (const dir of dirs) {
  if (readdirSync(dir).length === 0) rmSync(dir, { recursive: true });
}
console.log(`\nSynced ${changed.length} file(s), removed ${removed.length}.`);
