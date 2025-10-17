import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = path.resolve(__dirname, '..');
const RAW_DIR = path.join(BASE_DIR, 'data', 'raw');
const PROCESSED_DIR = path.join(BASE_DIR, 'data', 'processed');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function parseLdJson(dom) {
  const scripts = Array.from(dom.window.document.getElementsByTagName('script')).filter((script) => {
    const type = script.getAttribute('type');
    return type && type.trim() === 'application/ld+json';
  });
  return scripts
    .map((script) => script.textContent?.trim())
    .filter(Boolean)
    .flatMap((content) => {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          return parsed;
        }

        if (parsed && typeof parsed === 'object' && Array.isArray(parsed['@graph'])) {
          return parsed['@graph'];
        }

        return [parsed];
      } catch (error) {
        return [];
      }
    });
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function fixEncoding(value) {
  if (!value || typeof value !== 'string') {
    return value;
  }

  const needsFix = /[ÃÂâ]/.test(value);
  if (!needsFix) {
    return value;
  }

  try {
    const decoded = Buffer.from(value, 'binary').toString('utf8');
    return normalizeMisencoded(decoded);
  } catch (error) {
    try {
      // eslint-disable-next-line n/no-deprecated-api
      return normalizeMisencoded(decodeURIComponent(escape(value)));
    } catch (fallbackError) {
      return value;
    }
  }
}

function normalizeMisencoded(text) {
  if (!text) {
    return text;
  }

  const replacements = [
    ['Ã¡', 'á'],
    ['Ã©', 'é'],
    ['Ã­', 'í'],
    ['Ã³', 'ó'],
    ['Ãº', 'ú'],
    ['Ã±', 'ñ'],
    ['Ã�', 'Á'],
    ['Ã‰', 'É'],
    ['Ã', 'Í'],
    ['Ã“', 'Ó'],
    ['Ãš', 'Ú'],
    ['Ã‘', 'Ñ'],
    ['Ã¼', 'ü'],
    ['Ãœ', 'Ü'],
    ['â', '’'],
    ['â', '“'],
    ['â', '”'],
    ['â¢', '•'],
    ['â', '–'],
    ['â', '—'],
    ['â¦', '…'],
    ['â¬', '€'],
    ['â‚¬', '€'],
    ['Â¿', '¿'],
    ['Â¡', '¡'],
    ['Âº', 'º'],
    ['Âª', 'ª'],
  ];

  let normalized = text;
  for (const [pattern, replacement] of replacements) {
    normalized = normalized.split(pattern).join(replacement);
  }

  return normalized;
}

async function extractCelebrarlo() {
  const filePath = path.join(RAW_DIR, 'celebrarlo-en-las-nubes.html');
  const html = await fs.readFile(filePath, 'utf8');
  const dom = new JSDOM(html);
  const ldNodes = parseLdJson(dom);

  const profile = ldNodes.find((node) => node['@type'] === 'Person');
  const restaurant = ldNodes.find((node) => node['@type'] === 'Restaurant');

  const address = restaurant?.address ?? {};

  const heroSection = dom.window.document.querySelector('#sf-provider-info .sf-entries');
  const paragraphs = heroSection
    ? Array.from(heroSection.querySelectorAll('p')).map((p) => cleanText(p.textContent || ''))
    : [];

  const galleryImages = Array.from(dom.window.document.querySelectorAll('#sf-provider-gallery img'))
    .map((img) => {
      const src = img.getAttribute('data-lazy-src') || img.getAttribute('src');
      const alt = img.getAttribute('alt') || '';
      return src ? { src, alt } : null;
    })
    .filter(Boolean)
    .filter((item, index, array) => array.findIndex((candidate) => candidate.src === item.src) === index);

  const profileDescription = cleanText(fixEncoding(profile?.description || ''));
  const combinedDescription = profileDescription || cleanText(paragraphs.join(' '));

  return {
    source: 'celebrarlo',
    retrievedAt: new Date().toISOString(),
    originalUrl: 'https://www.celebrarlo.com/restaurante/en-las-nubes-restobar/',
    name: restaurant?.name || profile?.name || 'En las Nubes Restobar',
    description: combinedDescription,
    address: {
      street: address.streetAddress || null,
      locality: address.addressLocality || null,
      region: address.addressRegion || null,
      postalCode: address.postalCode || null,
      country: address.addressCountry || null,
      coordinates: restaurant?.geo || null,
    },
    telephone: restaurant?.telephone || null,
    cuisines: restaurant?.servesCuisine ? String(restaurant.servesCuisine).split(',').map((item) => cleanText(item)) : [],
    priceRange: fixEncoding(restaurant?.priceRange || null),
    gallery: galleryImages.slice(0, 30),
    notes: {
      capacities: paragraphs.find((p) => p.includes('capacidad')) || null,
      gastronomyHighlights: paragraphs.find((p) => p.includes('cachopo') || p.includes('fabada')) || null,
    },
  };
}

async function extractMenuWeb() {
  const filePath = path.join(RAW_DIR, 'menuweb-en-las-nubes.html');
  const html = await fs.readFile(filePath, 'utf8');
  const dom = new JSDOM(html);
  const ldNodes = parseLdJson(dom);
  const establishment = ldNodes.find((node) => node['@type'] === 'FoodEstablishment');

  const reviewList = (establishment?.reviews || []).map((review) => ({
    author: review.author?.name || null,
    rating: Number(review.reviewRating?.ratingValue) || null,
    body: cleanText(review.reviewBody || ''),
    language: review.inLanguage || 'es',
  }));

  const openingHours = Array.isArray(establishment?.openingHours) ? establishment.openingHours : [];

  const heroImageNodes = Array.from(
    dom.window.document.querySelectorAll('section.bg-white.rounded-md.shadow-sm.p-4 img, header img')
  ).map((img) => {
    const src = img.getAttribute('src');
    const alt = img.getAttribute('alt') || '';
    return src ? { src, alt } : null;
  }).filter(Boolean);

  const menuItems = Array.from(dom.window.document.querySelectorAll('section#warm-tapas li, section#appetizer li')).map(
    (node) => ({
      title: cleanText(node.querySelector('a')?.textContent || ''),
      image: node.querySelector('img')?.getAttribute('src') || null,
      href: node.querySelector('a')?.getAttribute('href') || null,
    })
  );

  return {
    source: 'menuweb',
    retrievedAt: new Date().toISOString(),
    originalUrl: establishment?.url || 'https://menuweb.menu/restaurants/el-cortijo/en-las-nubes-restobar-2',
    name: establishment?.name || 'En Las Nubes Restobar',
    description: cleanText(establishment?.description || ''),
    telephone: establishment?.telephone?.[0] || null,
    image: establishment?.image || null,
    cuisines: establishment?.servesCuisine || [],
    rating: {
      value: establishment?.aggregateRating?.ratingValue
        ? Number(establishment.aggregateRating.ratingValue)
        : null,
      count: establishment?.aggregateRating?.reviewCount
        ? Number(establishment.aggregateRating.reviewCount)
        : null,
    },
    address: establishment?.address || null,
    openingHours,
    acceptsReservations: Boolean(establishment?.acceptsReservations),
    reviews: reviewList.slice(0, 10),
    heroImages: heroImageNodes.slice(0, 10),
    menuItems,
    vcard: 'https://weur-cdn.carta.menu/storage/media/companies_vcards/79021030/En-Las-Nubes-Restobar-vCard-Contacto-Dirección-Teléfono.vcf',
  };
}

async function extractRestaurantGuru() {
  const filePath = path.join(RAW_DIR, 'restaurantguru-en-las-nubes.html');
  const html = await fs.readFile(filePath, 'utf8');
  const dom = new JSDOM(html);
  const ldNodes = parseLdJson(dom);
  const restaurant = ldNodes.find((node) => node['@type'] === 'Restaurant');

  const imageNodes = Array.from(dom.window.document.querySelectorAll('script')).filter((script) =>
    script.textContent?.includes('restaurant_collages.push')
  );

  const collageRegex = /restaurant_collages.push\((\{[^;]+\})\);/g;
  const collages = [];
  for (const script of imageNodes) {
    const text = script.textContent || '';
    let match;
    while ((match = collageRegex.exec(text))) {
      try {
        const json = JSON.parse(match[1]);
        if (json.src) {
          collages.push({
            src: json.src,
            category: json.collage_category,
            imageIds: [json.image1_id, json.image2_id, json.image3_id, json.image4_id].filter(Boolean),
          });
        }
      } catch (error) {
        // ignore parsing errors
      }
    }
  }

  const rankingBadge = dom.window.document.querySelector('.number.rank_tag.type_set_5');
  const ranking = rankingBadge ? cleanText(rankingBadge.textContent || '') : null;

  return {
    source: 'restaurantguru',
    retrievedAt: new Date().toISOString(),
    originalUrl: 'https://es.restaurantguru.com/En-las-Nubes-Restobar-Logrono',
    name: restaurant?.name || 'En las Nubes Restobar',
    description: cleanText(restaurant?.review?.description || ''),
    cuisines: restaurant?.servesCuisine || [],
    rating: {
      value: restaurant?.aggregateRating?.ratingValue
        ? Number(restaurant.aggregateRating.ratingValue)
        : null,
      count: restaurant?.aggregateRating?.reviewCount
        ? Number(restaurant.aggregateRating.reviewCount)
        : null,
    },
    priceRange: restaurant?.priceRange || null,
    address: restaurant?.address || null,
    geo: restaurant?.geo || null,
    telephone: restaurant?.telephone || null,
    openingHours: restaurant?.openingHours || [],
    ranking,
    heroImage: restaurant?.image || null,
    gallery: collages.slice(0, 25),
  };
}

async function writeJson(fileName, data) {
  const targetPath = path.join(PROCESSED_DIR, fileName);
  await fs.writeFile(targetPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return targetPath;
}

async function main() {
  await ensureDir(PROCESSED_DIR);

  const [celebrarlo, menuweb, restaurantguru] = await Promise.all([
    extractCelebrarlo(),
    extractMenuWeb(),
    extractRestaurantGuru(),
  ]);

  await Promise.all([
    writeJson('celebrarlo.json', celebrarlo),
    writeJson('menuweb.json', menuweb),
    writeJson('restaurantguru.json', restaurantguru),
    writeJson('index.json', {
      generatedAt: new Date().toISOString(),
      sources: [celebrarlo, menuweb, restaurantguru].map((entry) => ({
        source: entry.source,
        name: entry.name,
        originalUrl: entry.originalUrl,
        rating: entry.rating || null,
        telephone: entry.telephone || null,
      })),
    }),
  ]);
}

main().catch((error) => {
  console.error('Error extracting content:', error);
  process.exitCode = 1;
});
