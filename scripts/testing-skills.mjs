import { copyFile, mkdir, readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const skillNames = ['api-testing', 'ui-testing'];
const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== '--sync')) {
  throw new Error('Usage: node scripts/testing-skills.mjs [--sync]');
}

async function files(directory, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await files(join(directory, entry.name), path));
    else if (entry.isFile()) result.push(path);
    else throw new Error(`Expected a real file or directory: ${join(directory, entry.name)}`);
  }
  return result.sort();
}

for (const skillName of skillNames) {
  const source = join(root, '.agents/skills', skillName);
  const target = join(root, '.claude/skills', skillName);
  const sourceFiles = await files(source);
  if (!sourceFiles.includes('SKILL.md')) throw new Error('Source skill is missing SKILL.md');

  if (args[0] === '--sync') {
    for (const path of sourceFiles) {
      await mkdir(dirname(join(target, path)), { recursive: true });
      await copyFile(join(source, path), join(target, path));
    }
  }

  const targetFiles = await files(target).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  const differences = [];
  for (const path of new Set([...sourceFiles, ...targetFiles])) {
    if (!sourceFiles.includes(path)) differences.push(`Extra Claude copy file: ${path}`);
    else if (!targetFiles.includes(path)) differences.push(`Missing Claude copy file: ${path}`);
    else if (!(await readFile(join(source, path))).equals(await readFile(join(target, path)))) {
      differences.push(`Different content: ${path}`);
    }
  }

  if (differences.length) {
    console.error(differences.join('\n'));
    console.error('Edit the .agents copy, then run npm run skills:sync. Remove obsolete mirror files explicitly.');
    process.exitCode = 1;
  } else {
    console.log(`${skillName} skill copies match (${sourceFiles.length} files in each of ${relative(root, source)} and ${relative(root, target)}).`);
  }

}
