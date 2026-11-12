import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';
const BUDGET = {
  jsGzip: 100 * 1024,
  cssGzip: 40 * 1024,
  htmlGzip: 60 * 1024,
};
const PUBLIC_PAGES = ['index.html', 'kalkulator.html', 'skins.html', 'poradniki.html', 'porownaj.html'];

if (!existsSync(DIST)) {
  console.error('Brak katalogu dist. Uruchom najpierw npm run build.');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const all = walk(DIST).map(file => file.replace(/\\/g, '/'));
const sample = [
  ...PUBLIC_PAGES,
  ...all
    .map(file => file.replace(`${DIST}/`, ''))
    .filter(file => /^(kalkulator|skins|poradniki)\/[^/]+\.html$/.test(file))
    .slice(0, 3),
].filter(page => existsSync(join(DIST, page)));

function gzipSize(file) {
  return gzipSync(readFileSync(file)).length;
}

function resolveAsset(from, ref) {
  if (ref.startsWith('/')) return join(DIST, ref);
  return join(from, '..', ref);
}

function collectScripts(entry, seen = new Set()) {
  if (seen.has(entry) || !existsSync(entry)) return seen;
  seen.add(entry);
  const code = readFileSync(entry, 'utf8');
  for (const match of code.matchAll(/(?:from|import)\s*["'](\.{1,2}\/[^"']+\.js)["']/g)) {
    collectScripts(resolveAsset(entry, match[1]), seen);
  }
  return seen;
}

const failures = [];
const kb = bytes => `${(bytes / 1024).toFixed(1)} KB`;

for (const page of sample) {
  const file = join(DIST, page);
  const html = readFileSync(file, 'utf8');
  const scripts = new Set();
  for (const match of html.matchAll(/<script[^>]*\ssrc="([^"]+\.js)"/g)) {
    if (!match[1].startsWith('/')) continue;
    collectScripts(join(DIST, match[1]), scripts);
  }
  for (const match of html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g)) {
    collectScripts(join(DIST, match[1]), scripts);
  }
  const styles = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="(\/[^"]+\.css)"/g)].map(m => join(DIST, m[1]));

  const js = [...scripts].reduce((sum, script) => sum + gzipSize(script), 0);
  const css = styles.reduce((sum, style) => sum + gzipSize(style), 0);
  const htmlSize = gzipSize(file);

  console.log(`${page.padEnd(48)} JS ${kb(js).padStart(9)}  CSS ${kb(css).padStart(8)}  HTML ${kb(htmlSize).padStart(8)}`);
  if (js > BUDGET.jsGzip) failures.push(`${page}: JS ${kb(js)} przekracza budzet ${kb(BUDGET.jsGzip)}`);
  if (css > BUDGET.cssGzip) failures.push(`${page}: CSS ${kb(css)} przekracza budzet ${kb(BUDGET.cssGzip)}`);
  if (htmlSize > BUDGET.htmlGzip) failures.push(`${page}: HTML ${kb(htmlSize)} przekracza budzet ${kb(BUDGET.htmlGzip)}`);
}

const fonts = all.filter(file => file.endsWith('.woff2'));
console.log(`Fonty woff2: ${fonts.length} plikow, razem ${kb(fonts.reduce((sum, file) => sum + statSync(file).size, 0))}`);

if (failures.length) {
  for (const failure of failures) console.error(`Blad: ${failure}`);
  process.exit(1);
}
console.log('Budzet wydajnosci dotrzymany.');
