import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const paths = (await readFile(new URL('../e2e-migrated-specs.txt', import.meta.url), 'utf8'))
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);
const args = process.argv.slice(2);
const passWithNoTests = args.includes('--pass-with-no-tests');
const forwarded = args.filter((arg) => arg !== '--pass-with-no-tests');

if (paths.length === 0 && passWithNoTests) process.exit(0);

const child = spawn('npx', ['playwright', 'test', ...paths, ...forwarded], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
