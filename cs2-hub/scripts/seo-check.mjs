import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const config = readFileSync('astro.config.mjs', 'utf8');
const siteMatch = config.match(/site:\s*['"]([^'"]+)['"]/);
if (!siteMatch) {
  console.error('Nie znaleziono pola site w astro.config.mjs');
  process.exit(1);
}
const SITE = siteMatch[1].replace(/\/+$/, '');

const errors = [];
const warnings = [];

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function pathFromFile(file) {
  const rel = relative(DIST, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\/index\.html$/, '').replace(/\.html$/, '');
}

function normalize(url) {
  const path = url.replace(SITE, '') || '/';
  return path === '/' ? '/' : path.replace(/\/+$/, '');
}

function attr(html, pattern) {
  const match = html.match(pattern);
  return match ? match[1].trim() : '';
}

if (!existsSync(DIST)) {
  console.error('Brak katalogu dist. Uruchom najpierw npm run build.');
  process.exit(1);
}

const pages = walk(DIST)
  .filter(file => file.endsWith('.html'))
  .filter(file => !/google[a-z0-9]+\.html$/.test(file))
  .map(file => {
    const html = readFileSync(file, 'utf8');
    return {
      file,
      path: pathFromFile(file),
      title: attr(html, /<title>([^<]*)<\/title>/),
      description: attr(html, /<meta name="?description"? content="?([^">]*)"?/),
      canonical: attr(html, /<link rel="?canonical"? href="?([^">\s]*)"?/),
      robots: attr(html, /<meta name="?robots"? content="?([^">]*)"?/),
    };
  })
  .filter(page => page.path !== '/404');

const indexable = pages.filter(page => !/noindex/i.test(page.robots));

const robotsPath = join(DIST, 'robots.txt');
if (!existsSync(robotsPath)) {
  errors.push('Brak pliku robots.txt');
} else {
  const robots = readFileSync(robotsPath, 'utf8');
  if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) {
    errors.push(`robots.txt nie wskazuje sitemapy ${SITE}/sitemap.xml`);
  }
  if (/^Disallow:\s*\/\s*$/m.test(robots)) {
    errors.push('robots.txt blokuje cala strone (Disallow: /)');
  }
}

const sitemapPath = join(DIST, 'sitemap.xml');
let sitemapPaths = [];
if (!existsSync(sitemapPath)) {
  errors.push('Brak pliku sitemap.xml');
} else {
  const xml = readFileSync(sitemapPath, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  const seen = new Set();

  for (const loc of locs) {
    if (!loc.startsWith(SITE)) errors.push(`Sitemap: adres spoza domeny ${loc}`);
    if (seen.has(loc)) errors.push(`Sitemap: duplikat ${loc}`);
    seen.add(loc);

    const path = normalize(loc);
    sitemapPaths.push(path);
    const page = pages.find(candidate => candidate.path === path);

    if (!page) {
      errors.push(`Sitemap: brak wygenerowanej strony dla ${loc}`);
      continue;
    }
    if (/noindex/i.test(page.robots)) errors.push(`Sitemap: strona z noindex ${loc}`);
    if (!page.canonical) errors.push(`Sitemap: brak canonical na ${loc}`);
    else if (page.canonical !== loc) {
      errors.push(`Sitemap: canonical ${page.canonical} rozni sie od ${loc}`);
    }
  }

  if (/<(changefreq|priority)>/.test(xml)) {
    warnings.push('Sitemap zawiera changefreq lub priority (Google je ignoruje)');
  }
}

for (const page of indexable) {
  if (!sitemapPaths.includes(page.path)) {
    errors.push(`Strona indeksowalna bez wpisu w sitemapie: ${page.path}`);
  }
  if (!page.canonical) errors.push(`Brak canonical: ${page.path}`);
  else if (!page.canonical.startsWith(SITE)) errors.push(`Canonical spoza domeny: ${page.path}`);
  else if (page.canonical !== `${SITE}${page.path === '/' ? '/' : page.path}`) {
    errors.push(`Canonical niezgodny z adresem strony ${page.path}: ${page.canonical}`);
  }
  if (!page.title) errors.push(`Brak title: ${page.path}`);
  if (!page.description) errors.push(`Brak meta description: ${page.path}`);
}

for (const field of ['title', 'description']) {
  const groups = new Map();
  for (const page of indexable) {
    if (!page[field]) continue;
    groups.set(page[field], [...(groups.get(page[field]) ?? []), page.path]);
  }
  for (const [value, paths] of groups) {
    if (paths.length > 1) errors.push(`Zduplikowany ${field} (${paths.join(', ')}): ${value.slice(0, 60)}`);
  }
}

console.log(`Sprawdzono ${pages.length} stron, indeksowalnych: ${indexable.length}, w sitemapie: ${sitemapPaths.length}`);
for (const warning of warnings) console.log(`Ostrzezenie: ${warning}`);
for (const error of errors) console.error(`Blad: ${error}`);

if (errors.length) {
  console.error(`Wykryto ${errors.length} problemow.`);
  process.exit(1);
}
console.log('Kontrola SEO zakonczona bez bledow.');
