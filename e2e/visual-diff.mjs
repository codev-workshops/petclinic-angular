// Pixel-diffs e2e/__screenshots__/angular/*.png against e2e/__screenshots__/react/*.png
// and writes e2e/__screenshots__/diff/<name>.png plus e2e/__screenshots__/report.md.
// Usage: node e2e/visual-diff.mjs [--threshold 0.2]
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '__screenshots__');
const angularDir = path.join(root, 'angular');
const reactDir = path.join(root, 'react');
const diffDir = path.join(root, 'diff');
const thresholdArg = process.argv.indexOf('--threshold');
const threshold = thresholdArg === -1 ? 0.2 : Number(process.argv[thresholdArg + 1]);

mkdirSync(diffDir, { recursive: true });

const names = [...new Set([...readdirSync(angularDir), ...readdirSync(reactDir)])]
  .filter((f) => f.endsWith('.png'))
  .sort();

const rows = [];
for (const name of names) {
  const a = path.join(angularDir, name);
  const r = path.join(reactDir, name);
  if (!existsSync(a) || !existsSync(r)) {
    rows.push({ name, status: 'missing', pct: null });
    continue;
  }
  const img1 = PNG.sync.read(readFileSync(a));
  const img2 = PNG.sync.read(readFileSync(r));
  const width = Math.max(img1.width, img2.width);
  const height = Math.max(img1.height, img2.height);
  const pad = (img) => {
    if (img.width === width && img.height === height) return img;
    const out = new PNG({ width, height });
    out.data.fill(255);
    PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0);
    return out;
  };
  const p1 = pad(img1);
  const p2 = pad(img2);
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(p1.data, p2.data, diff.data, width, height, { threshold });
  writeFileSync(path.join(diffDir, name), PNG.sync.write(diff));
  rows.push({ name, status: 'compared', pct: (mismatched / (width * height)) * 100 });
}

const lines = [
  '| Screenshot | Pixel diff % | Diff image |',
  '|---|---|---|',
  ...rows.map((row) =>
    row.status === 'missing'
      ? `| ${row.name} | n/a (missing on one target) | |`
      : `| ${row.name} | ${row.pct.toFixed(2)}% | \`diff/${row.name}\` |`,
  ),
];
writeFileSync(path.join(root, 'report.md'), `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
