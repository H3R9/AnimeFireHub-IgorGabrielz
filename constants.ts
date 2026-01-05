export const PACKAGE_JSON_TEMPLATE = `{
  "name": "animefire-addon-stremio",
  "version": "1.3.0",
  "description": "Addon Brasileiro para Stremio com scraping do AnimeFire, cache e suporte a HD.",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "stremio-addon-sdk": "^1.6.8",
    "axios": "^1.6.2",
    "cheerio": "^1.0.0-rc.12"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "stremio",
    "addon",
    "anime",
    "animefire",
    "brasil"
  ],
  "author": "AnimeFireHub",
  "license": "MIT"
}`;

export const SERVER_TEMPLATE = `const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");
const cheerio = require("cheerio");

// --- FASE 3: SISTEMA DE CACHE (OTIMIZAÇÃO) ---
class CacheManager {
    constructor(ttlSeconds = 3600) { 
        this.cache = new Map();
        this.ttl = ttlSeconds * 1000;
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }

    set(key, value) {
        this.cache.set(key, {
            value,
            expiry: Date.now() + this.ttl
        });
    }
}

const catalogCache = new CacheManager(1800); // 30 min
const metaCache = new CacheManager(3600 * 24); // 24 horas
const streamCache = new CacheManager(3600 * 4); // 4 horas

// --- DEFINIÇÃO DO ADDON (MANIFESTO) ---
const builder = new addonBuilder({
  id: "org.animefire.complete",
  version: "1.3.0",
  name: "AnimeFire Hub",
  description: "Addon Brasileiro de Animes. Assista lançamentos em HD direto do AnimeFire. Inclui Cache e Auto-Update.",
  logo: "https://animefire.plus/img/logo.png", 
  catalogs: [
    {
      type: "anime",
      id: "animefire_lancamentos",
      name: "AnimeFire: Lançamentos",
    },
    {
      type: "anime",
      id: "animefire_search",
      name: "AnimeFire: Busca",
      extra: [{ name: "search", isRequired: true }],
    },
  ],
  resources: ["catalog", "meta", "stream"], 
  types: ["anime", "series", "movie"],
  idPrefixes: ["af_"],
});

// --- CONFIGURAÇÃO ---
const BASE_URL = "https://animefire.plus"; 
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  "Referer": BASE_URL,
  "Origin": BASE_URL
};

// --- FUNÇÕES AUXILIARES ---
const log = (msg) => console.log(\`[AnimeFire] \${msg}\`);

function urlToId(url) {
  if (!url) return null;
  const slug = url.split("/").pop();
  return "af_" + slug;
}

async function fetchAndParseCatalog(url) {
    try {
        const { data } = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(data);
        const metas = [];

        $(".articleDiv").each((i, el) => {
            const title = $(el).find(".film-name").text().trim();
            const link = $(el).find("a").attr("href");
            const img = $(el).find("img").attr("data-src") || $(el).find("img").attr("src");
            
            if (title && link) {
                metas.push({
                    id: urlToId(link),
                    type: "anime",
                    name: title,
                    poster: img,
                    description: "Disponível no AnimeFire", 
                });
            }
        });
        return metas;
    } catch (e) {
        log(\`Erro no Scraper Catálogo: \${e.message}\`);
        return [];
    }
}

// --- HANDLERS (LÓGICA PRINCIPAL) ---

builder.defineCatalogHandler(async ({ type, id, extra }) => {
  let url = BASE_URL;
  if (extra.search) url = \`\${BASE_URL}/pesquisar/\${encodeURIComponent(extra.search)}\`;
  
  const cacheKey = \`cat:\${url}\`;
  const cached = catalogCache.get(cacheKey);
  if (cached) return { metas: cached };

  const metas = await fetchAndParseCatalog(url);
  if (metas.length > 0) catalogCache.set(cacheKey, metas);
  
  return { metas };
});

builder.defineMetaHandler(async ({ type, id }) => {
  const cached = metaCache.get(id);
  if (cached) return { meta: cached };

  try {
    const slug = id.replace("af_", "");
    const url = \`\${BASE_URL}/anime/\${slug}\`;
    
    const { data } = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(data);

    const title = $(".div_anime_names .quicksand400").first().text().trim() || slug;
    const poster = $(".sub_anime_page_img img").attr("src");
    const description = $(".divSynopsys").text().trim();
    const year = $(".animeInfo span:contains('Ano:')").next().text().trim();
    const genres = $(".genres a").map((i, el) => $(el).text()).get();

    const videos = [];
    const episodeLinks = $("a[href*='/video/']");
    
    episodeLinks.each((i, el) => {
      const epUrl = $(el).attr("href");
      const epName = $(el).text().trim();
      const epSlug = epUrl.split("/").pop();
      const videoId = \`\${id}:\${epSlug}\`; 
      const epNumber = epName.match(/\\d+/); 
      
      videos.push({
        id: videoId,
        title: epName,
        released: new Date().toISOString(),
        episode: epNumber ? parseInt(epNumber[0]) : i + 1,
        season: 1,
      });
    });
    videos.reverse();

    const metaObj = {
        id, type: "anime", name: title, poster, background: poster,
        description, releaseInfo: year, genres, videos
    };

    metaCache.set(id, metaObj);
    return { meta: metaObj };
  } catch (e) {
    return { meta: { id, type, name: "Erro ao carregar" } };
  }
});

builder.defineStreamHandler(async ({ type, id }) => {
  const cached = streamCache.get(id);
  if (cached) return { streams: cached };

  try {
    if (!id.includes(":")) return { streams: [] };
    
    const [animeId, epSlug] = id.split(":");
    const animeSlug = animeId.replace("af_", "");
    const url = \`\${BASE_URL}/video/\${animeSlug}/\${epSlug}\`;
    
    const { data } = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(data);
    
    const streams = [];
    const scripts = $("script").map((i, el) => $(el).html()).get().join(" ");
    const mp4Matches = scripts.match(/https?:\\/\\/[^"']+\\.mp4/g);
    
    if (mp4Matches) {
        const uniqueLinks = [...new Set(mp4Matches)];
        uniqueLinks.forEach((link, idx) => {
            streams.push({
                title: \`⚡ AnimeFire HD (Opção \${idx + 1})\`,
                url: link
            });
        });
    }

    const videoTagSrc = $("video").attr("data-video-src") || $("video source").attr("src");
    if (videoTagSrc && !streams.find(s => s.url === videoTagSrc)) {
        streams.push({ title: "🎬 Player Principal HTML5", url: videoTagSrc });
    }

    $("a.download-button, a[href$='.mp4']").each((i, el) => {
        const link = $(el).attr("href");
        if (link && !streams.find(s => s.url === link)) {
             streams.push({ title: "💾 Link Direto / Backup", url: link });
        }
    });

    if (streams.length > 0) {
        streamCache.set(id, streams);
        return { streams };
    }

    return { streams: [{ title: "❌ Nenhum vídeo compatível encontrado", url: "" }] };
  } catch (e) {
    return { streams: [] };
  }
});

// --- SERVIDOR & PORTA DINÂMICA (CRUCIAL PARA DEPLOY) ---
const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: port });

// Anti-Crash Handler
process.on('uncaughtException', function (err) {
    console.error('CRITICAL ERROR:', err);
});

console.log(\`🚀 AnimeFire Addon v1.3.0 (Final) rodando na porta \${port}\`);
console.log(\`👉 Abra seu navegador em: http://localhost:\${port}\`);
`;