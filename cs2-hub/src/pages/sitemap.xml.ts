import type { APIRoute } from 'astro';
import { getAllCases } from '../lib/cases';
import { getAllSkins } from '../lib/skins';

const GUIDE_SLUGS = ["jak-handlowac-skinami-cs2","float-value-przewodnik","najlepsze-skiny-do-inwestowania-2025","czy-warto-otwierac-skrzynki","buff163-vs-steam-market","jak-czytac-wykres-cen-steamu","stickery-na-skinach-wartosc","bezpieczenstwo-handel-skinami","pattern-index-cs2","jak-importowac-ekwipunek-steam","skiny-stattrack-czy-warto","noze-cs2-ranking","trading-up-kontrakty","cs2-major-wplyw-na-ceny","skinport-przewodnik","souvenir-skiny-cs2","portfel-skinow-dywersyfikacja","rekawice-cs2-przewodnik","podatek-od-handlu-skinami","case-hardened-blue-gem","doppler-gamma-doppler-fazy","jak-wycenic-skin-przed-sprzedaza","limitowane-operacje-cs2","arbitraz-cenowy-platformy","agenci-cs2-kolekcjonowanie","cs-money-platformy-wymiany","naklejki-rzadkosc-holo-foil-gold","jak-rozpoznac-scam-trade-offer","steam-sezonowe-wyprzedaze-wplyw-na-ceny","music-kits-cs2-przewodnik","vanilla-skiny-noze-dlaczego-drogie","anodyzowane-wykonczenia-typy","float-cap-dlaczego-niektore-skiny-nie-sa-battle-scarred","jak-zabezpieczyc-konto-steam","cs2-vs-csgo-rynek-skinow","dziennik-tradingowy-jak-prowadzic","tygodniowe-dropy-cs2-czy-warto"];

export const GET: APIRoute = async () => {
  const CASES = await getAllCases();
  const SKINS = await getAllSkins();

  const baseUrl = 'https://cs2-market.netlify.app';

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/kalkulator', priority: '0.9', changefreq: 'weekly' },
    { url: '/skins', priority: '0.9', changefreq: 'weekly' },
    { url: '/poradniki', priority: '0.7', changefreq: 'weekly' },
    { url: '/porownaj', priority: '0.6', changefreq: 'weekly' },
  ];

  const casePages = CASES.map(c => ({
    url: `/kalkulator/${c.slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  }));

  const skinPages = SKINS.map(s => ({
    url: `/skins/${s.slug}`,
    priority: '0.7',
    changefreq: 'weekly',
  }));

  const guidePages = GUIDE_SLUGS.map(slug => ({
    url: `/poradniki/${slug}`,
    priority: '0.6',
    changefreq: 'monthly',
  }));

  const allPages = [...staticPages, ...casePages, ...skinPages, ...guidePages];
  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
