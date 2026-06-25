export type WeaponCategory = 'rifle' | 'pistol' | 'smg' | 'sniper' | 'shotgun' | 'heavy' | 'knife' | 'gloves';

export interface SkinEntry {
  id: string;
  slug: string;
  weapon: string;
  name: string;
  category: WeaponCategory;
  rarity: 'consumer' | 'industrial' | 'mil-spec' | 'restricted' | 'classified' | 'covert' | 'contraband' | 'extraordinary';
  minFloat: number;
  maxFloat: number;
  wears: string[];
  description: string;
  lore: string;
  collection?: string;
  caseSource?: string;
  releaseYear: number;
  steamMarketUrl: string;
  tags: string[];
}

const STANDARD_WEARS = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];

export const SKINS: SkinEntry[] = [
  // AK-47
  {
    id: 'ak47-redline',
    slug: 'ak-47-redline',
    weapon: 'AK-47',
    name: 'Redline',
    category: 'rifle',
    rarity: 'classified',
    minFloat: 0.10,
    maxFloat: 0.70,
    wears: ['Minimal Wear', 'Field-Tested', 'Well-Worn'],
    description: 'AK-47 Redline to jeden z najbardziej rozpoznawalnych i poszukiwanych skinów w CS2. Ciemnoszare wykończenie z czerwonymi akcentami sprawia, że wygląda elegancko i profesjonalnie. Skin jest niedostępny w Factory New, co czyni Minimal Wear najlepszą dostępną jakością.',
    lore: 'Przemalowany przez mechanika z zamiłowaniem do czerwonych akcentów.',
    collection: 'Phoenix Collection',
    releaseYear: 2014,
    steamMarketUrl: 'https://steamcommunity.com/market/listings/730/AK-47%20%7C%20Redline%20%28Field-Tested%29',
    tags: ['popular', 'trading', 'investment', 'no-fn'],
  },
  {
    id: 'ak47-asiimov',
    slug: 'ak-47-asiimov',
    weapon: 'AK-47',
    name: 'Asiimov',
    category: 'rifle',
    rarity: 'covert',
    minFloat: 0.25,
    maxFloat: 1.00,
    wears: ['Field-Tested', 'Well-Worn', 'Battle-Scarred'],
    description: 'AK-47 Asiimov to futurystyczny skin z charakterystycznym pomarańczowo-białym wzorem. Jest niedostępny w Factory New i Minimal Wear — najlepsza osiągalna jakość to Field-Tested. Wysoki float sprawia, że nawet "nowe" egzemplarze mają sporo zużycia.',
    lore: 'Futurystyczny design inspirowany estetyką science-fiction.',
    caseSource: 'Operation Wildfire Case',
    releaseYear: 2016,
    steamMarketUrl: 'https://steamcommunity.com/market/listings/730/AK-47%20%7C%20Asiimov%20%28Field-Tested%29',
    tags: ['popular', 'high-float', 'no-fn', 'no-mw', 'covert'],
  },
  {
    id: 'ak47-ice-coaled',
    slug: 'ak-47-ice-coaled',
    weapon: 'AK-47',
    name: 'Ice Coaled',
    category: 'rifle',
    rarity: 'covert',
    minFloat: 0.00,
    maxFloat: 0.80,
    wears: STANDARD_WEARS,
    description: 'AK-47 Ice Coaled z Recoil Case to skin w kolorystyce lodu i węgla — kontrast bieli i czerni. Dostępny we wszystkich wear, co czyni go dostępnym dla każdego budżetu. Factory New wygląda wyjątkowo efektownie.',
    lore: 'Zimowy kamuflaż stworzony dla operacji w ekstremalnych warunkach.',
    caseSource: 'Recoil Case',
    releaseYear: 2022,
    steamMarketUrl: 'https://steamcommunity.com/market/listings/730/AK-47%20%7C%20Ice%20Coaled%20%28Factory%20New%29',
    tags: ['covert', 'recoil-case', 'investment'],
  },
  {
    id: 'ak47-calm-waters',
    slug: 'ak-47-calm-waters',
    weapon: 'AK-47',
    name: 'Calm Waters',
    category: 'rifle',
    rarity: 'covert',
    minFloat: 0.00,
    maxFloat: 0.80,
    wears: STANDARD_WEARS,
    description: 'AK-47 Calm Waters to skin z Revolution Case z delikatnym niebiesko-zielonym wzorem przypominającym spokojną wodę. Jeden z bardziej estetycznych skinów do AK — minimalistyczny, a zarazem wyróżniający się.',
    lore: 'Inspirowany spokojnymi wodami śródziemnomorskich lagun.',
    caseSource: 'Revolution Case',
    releaseYear: 2023,
    steamMarketUrl: 'https://steamcommunity.com/market/listings/730/AK-47%20%7C%20Calm%20Waters%20%28Factory%20New%29',
    tags: ['covert', 'revolution-case'],
  },
  // AWP
  {
    id: 'awp-dragon-lore',
    slug: 'awp-dragon-lore',
    weapon: 'AWP',
    name: 'Dragon Lore',
    category: 'sniper',
    rarity: 'covert',
    minFloat: 0.01,
    maxFloat: 0.70,
    wears: ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn'],
    description: 'AWP Dragon Lore to jeden z najbardziej legendarnych i cennych skinów w historii CS2. Przedstawia smoka na złotym tle — jest symbolem statusu w grze. Ceny Factory New sięgają setek tysięcy złotych, szczególnie ze stakerami lub w wersji souvenir.',
    lore: 'Ukuta w ogniu smoczym, przeznaczona dla tych, którzy śmią sięgać po legendę.',
    collection: 'Cobblestone Collection',
    releaseYear: 2014,
    steamMarketUrl: 'https://steamcommunity.com/market/listings/730/AWP%20%7C%20Dragon%20Lore%20%28Field-Tested%29',
    tags: ['legendary', 'investment', 'expensive', 'status'],
  },
  {
    id: 'awp-asiimov',
    slug: 'awp-asiimov',
    weapon: 'AWP',
    name: 'Asiimov',
    category: 'sniper',
    rarity: 'covert',
    minFloat: 0.18,
    maxFloat: 1.00,
    wears: ['Field-Tested', 'Well-Worn', 'Battle-Scarred'],
    description: 'AWP Asiimov to futurystyczny skin z pomarańczowo-białym wzorem — jeden z najbardziej rozpoznawalnych skinów do AWP. Wysoki minimalny float (0.18) oznacza, że nawet Field-Tested będzie miał widoczne zużycie.',
    lore: 'Zaprojektowany przez inżyniera z wizją przyszłości.',
    caseSource: 'Operation Phoenix Weapon Case',
    releaseYear: 2014,
    steamMarketUrl: 'https://steamcommunity.com/market/listings/730/AWP%20%7C%20Asiimov%20%28Field-Tested%29',
    tags: ['popular', 'covert', 'high-float', 'no-fn'],
  },
  // M4A4
  {
    id: 'm4a4-howl',
    slug: 'm4a4-howl',
    weapon: 'M4A4',
    name: 'Howl',
    category: 'rifle',
    rarity: 'contraband',
    minFloat: 0.00,
    maxFloat: 0.40,
    wears: ['Factory New', 'Minimal Wear', 'Field-Tested'],
    description: 'M4A4 Howl to jedyny skin kategorii Contraband w CS2 — po kontrowersji związanej z prawami autorskimi w 2014 roku skin został wycofany ze skrzynek, stając się wyjątkowo rzadki. Jedyne istniejące egzemplarze to te z przed usunięcia. Jeden z najdroższych skinów w grze.',
    lore: 'Wyjęty z obiegu po naruszeniu praw autorskich w 2014 roku. Jedyne istniejące egzemplarze.',
    releaseYear: 2014,
    steamMarketUrl: 'https://steamcommunity.com/market/listings/730/M4A4%20%7C%20Howl%20%28Factory%20New%29',
    tags: ['contraband', 'legendary', 'investment', 'rare', 'expensive'],
  },
  {
    id: 'm4a4-temukau',
    slug: 'm4a4-temukau',
    weapon: 'M4A4',
    name: 'Temukau',
    category: 'rifle',
    rarity: 'covert',
    minFloat: 0.00,
    maxFloat: 0.80,
    wears: STANDARD_WEARS,
    description: 'M4A4 Temukau to skin z Revolution Case inspirowany maoryską kulturą i tatuażami tā moko. Niebiesko-czarne wzory na ciemnym tle tworzą unikalny wygląd. Jeden z bardziej artystycznych skinów dodanych do CS2.',
    lore: 'Wzory inspirowane tradycyjnymi tatuażami Maorysów — każda linia ma swoje znaczenie.',
    caseSource: 'Revolution Case',
    releaseYear: 2023,
    steamMarketUrl: 'https://steamcommunity.com/market/listings/730/M4A4%20%7C%20Temukau%20%28Factory%20New%29',
    tags: ['covert', 'revolution-case', 'artistic'],
  },
  // M4A1-S
  {
    id: 'm4a1s-printstream',
    slug: 'm4a1-s-printstream',
    weapon: 'M4A1-S',
    name: 'Printstream',
    category: 'rifle',
    rarity: 'covert',
    minFloat: 0.00,
    maxFloat: 0.55,
    wears: ['Factory New', 'Minimal Wear', 'Field-Tested'],
    description: 'M4A1-S Printstream to jeden z najbardziej pożądanych skinów do M4A1-S. Biało-czarny wzór inspirowany typografią i drukiem jest wyjątkowo elegancki. Dostępny tylko do floatu 0.55, co oznacza brak Well-Worn i Battle-Scarred.',
    lore: 'Inspirowany estetyką nowoczesnej typografii i druku offsetowego.',
    caseSource: 'Dreams & Nightmares Case',
    releaseYear: 2022,
    steamMarketUrl: 'https://steamcommunity.com/market/listings/730/M4A1-S%20%7C%20Printstream%20%28Factory%20New%29',
    tags: ['covert', 'popular', 'investment', 'trading'],
  },
  {
    id: 'm4a1s-black-lotus',
    slug: 'm4a1-s-black-lotus',
    weapon: 'M4A1-S',
    name: 'Black Lotus',
    category: 'rifle',
    rarity: 'covert',
    minFloat: 0.00,
    maxFloat: 0.80,
    wears: STANDARD_WEARS,
    description: 'M4A1-S Black Lotus to skin z Kilowatt Case z motywem czarnego lotosu na ciemnym tle z subtelnymi złotymi akcentami. Elegancki i minimalistyczny — jeden z bardziej estetycznych dodatków w nowych skrzynkach CS2.',
    lore: 'Czarny lotos — symbol siły i odrodzenia w kulturze wschodniej.',
    caseSource: 'Kilowatt Case',
    releaseYear: 2024,
    steamMarketUrl: 'https://steamcommunity.com/market/listings/730/M4A1-S%20%7C%20Black%20Lotus%20%28Factory%20New%29',
    tags: ['covert', 'kilowatt-case', 'new'],
  },
  // Desert Eagle
  {
    id: 'deagle-printstream',
    slug: 'desert-eagle-printstream',
    weapon: 'Desert Eagle',
    name: 'Printstream',
    category: 'pistol',
    rarity: 'covert',
    minFloat: 0.00,
    maxFloat: 0.55,
    wears: ['Factory New', 'Minimal Wear', 'Field-Tested'],
    description: 'Desert Eagle Printstream to kultowy skin z Fracture Case. Biało-czarny wzór typograficzny sprawia, że ta Deagle wygląda wyjątkowo premium. Jeden z najbardziej pożądanych skinów do pistoletu w całym CS2.',
    lore: 'Precyzja drukarza przeniesiona na precyzję strzelca.',
    caseSource: 'Fracture Case',
    releaseYear: 2020,
    steamMarketUrl: 'https://steamcommunity.com/market/listings/730/Desert%20Eagle%20%7C%20Printstream%20%28Factory%20New%29',
    tags: ['covert', 'fracture-case', 'popular', 'investment'],
  },
  // USP-S
  {
    id: 'usps-kill-confirmed',
    slug: 'usp-s-kill-confirmed',
    weapon: 'USP-S',
    name: 'Kill Confirmed',
    category: 'pistol',
    rarity: 'covert',
    minFloat: 0.00,
    maxFloat: 0.38,
    wears: ['Factory New', 'Minimal Wear', 'Field-Tested'],
    description: 'USP-S Kill Confirmed to jeden z najbardziej charakterystycznych skinów do pistoletu startowego CT. Wzór z czaszką i krzyżem w stylu militarnym nadaje broni wyjątkowy charakter. Niska wartość maksymalnego floatu (0.38) sprawia, że Battle-Scarred nie istnieje.',
    lore: 'Taktyczne oznaczenia dla potwierdzenia eliminacji.',
    caseSource: 'Clutch Case',
    releaseYear: 2018,
    steamMarketUrl: 'https://steamcommunity.com/market/listings/730/USP-S%20%7C%20Kill%20Confirmed%20%28Factory%20New%29',
    tags: ['covert', 'pistol', 'low-max-float'],
  },
  // Glock
  {
    id: 'glock-fade',
    slug: 'glock-18-fade',
    weapon: 'Glock-18',
    name: 'Fade',
    category: 'pistol',
    rarity: 'restricted',
    minFloat: 0.00,
    maxFloat: 0.08,
    wears: ['Factory New', 'Minimal Wear'],
    description: 'Glock-18 Fade to klasyczny skin z pięknym gradientem od żółtego przez różowy do fioletowego. Bardzo niski maksymalny float (0.08) oznacza, że prawie wszystkie egzemplarze są w Factory New lub Minimal Wear. Procent "fade" (pełny gradient vs częściowy) ma ogromny wpływ na cenę.',
    lore: 'Farba termochromowa reaguje na temperaturę lufy.',
    collection: 'Dust Collection',
    releaseYear: 2013,
    steamMarketUrl: 'https://steamcommunity.com/market/listings/730/Glock-18%20%7C%20Fade%20%28Factory%20New%29',
    tags: ['fade', 'percentage', 'investment', 'low-float', 'classic'],
  },
];

export function getSkinBySlug(slug: string): SkinEntry | undefined {
  return SKINS.find(s => s.slug === slug);
}

export function getSkinsByCategory(category: WeaponCategory): SkinEntry[] {
  return SKINS.filter(s => s.category === category);
}

export function getSkinsByWeapon(weapon: string): SkinEntry[] {
  return SKINS.filter(s => s.weapon === weapon);
}

export const WEAPON_CATEGORIES: Record<WeaponCategory, string> = {
  rifle: 'Karabiny',
  pistol: 'Pistolety',
  smg: 'Pistolety maszynowe',
  sniper: 'Karabiny snajperskie',
  shotgun: 'Strzelby',
  heavy: 'Ciężkie',
  knife: 'Noże',
  gloves: 'Rękawice',
};

export const RARITY_MAP = {
  consumer:      { label: 'Consumer Grade', color: '#b0c3d9' },
  industrial:    { label: 'Industrial Grade', color: '#5e98d9' },
  'mil-spec':    { label: 'Mil-Spec', color: '#4b69ff' },
  restricted:    { label: 'Restricted', color: '#8847ff' },
  classified:    { label: 'Classified', color: '#d32ce6' },
  covert:        { label: 'Covert', color: '#eb4b4b' },
  contraband:    { label: 'Contraband', color: '#e4ae39' },
  extraordinary: { label: 'Extraordinary', color: '#e4ae39' },
};
