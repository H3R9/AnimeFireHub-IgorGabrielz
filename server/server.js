const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");
const cheerio = require("cheerio");

// --- SISTEMA DE CACHE ---
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
    description: "Addon Brasileiro de Animes. Assista lançamentos em HD direto do AnimeFire.io.",
    logo: "https://animefire.io/img/logo.png",
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
const BASE_URL = "https://animefire.io";
const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://google.com.br/",
    "Origin": "https://animefire.io",
    "Connection": "keep-alive"
};

// --- FUNÇÕES AUXILIARES ---
const log = (msg) => console.error(`[AnimeFire] ${msg}`);

function urlToId(url) {
    if (!url) return null;
    const parts = url.split("/").filter(Boolean);
    const slug = parts.pop();
    return "af_" + slug;
}

async function fetchAndParseCatalog(url) {
    try {
        console.error(`[AnimeFire] Buscando catálogo em: ${url}`);
        const response = await axios.get(url, {
            headers: HEADERS,
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const metas = [];

        $("a[href*='/animes/']").each((i, el) => {
            let link = $(el).attr("href");
            if (!link) return;

            // Convert relative to absolute if needed
            if (link.startsWith("/")) link = BASE_URL + link;

            const card = $(el).closest("article, .cardUltimosEps, div[class*='col']");
            const title = card.find(".animeTitle, h3").text().trim() || $(el).text().trim();
            const imgTag = card.find("img").first();
            let img = imgTag.attr("data-src") || imgTag.attr("src") || $(el).find("img").attr("src");

            if (img && img.startsWith("/")) img = BASE_URL + img;

            if (title && title.length > 2 && !title.includes("Ver todos") && !title.includes("Animes")) {
                const id = urlToId(link);
                if (id !== "af_animes") {
                    metas.push({
                        id,
                        type: "anime",
                        name: title,
                        poster: img,
                        description: "Disponível no AnimeFire",
                    });
                }
            }
        });
        if (metas.length === 0) {
            console.error(`[AnimeFire] Nenhum item encontrado. Início do HTML: ${response.data.substring(0, 200)}`);
        }

        console.error(`[AnimeFire] Encontrados ${metas.length} itens no catálogo.`);
        return metas.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    } catch (e) {
        console.error(`[AnimeFire] Erro no Scraper Catálogo: ${e.message}`);
        return [];
    }
}

// --- HANDLERS ---

builder.defineCatalogHandler(async ({ type, id, extra }) => {
    let mainUrl;
    if (extra.search) {
        // O AnimeFire exige busca em minúsculo e com hífens
        const searchTerm = extra.search.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
            .replace(/ /g, "-")
            .replace(/[^a-z0-9-]/g, ""); // remove caracteres especiais
        mainUrl = `${BASE_URL}/pesquisar/${searchTerm}`;
    } else {
        mainUrl = `${BASE_URL}/lista-de-animes-legendados`;
    }

    const cacheKey = `cat:${mainUrl}`;
    const cached = catalogCache.get(cacheKey);
    if (cached) return { metas: cached };

    let metas = await fetchAndParseCatalog(mainUrl);

    // Fallback to home page or another listing if empty
    if (metas.length === 0 && !extra.search) {
        metas = await fetchAndParseCatalog(BASE_URL);
    }

    if (metas.length > 0) catalogCache.set(cacheKey, metas);

    return { metas };
});

builder.defineMetaHandler(async ({ type, id }) => {
    const cached = metaCache.get(id);
    if (cached) return { meta: cached };

    try {
        const slug = id.replace("af_", "");

        // The catalog IDs might have '-todos-os-episodios' or not.
        // Ensure we have a clean slug for the base URL.
        const cleanSlug = slug.replace("-todos-os-episodios", "");

        const urls = [
            `${BASE_URL}/animes/${cleanSlug}-todos-os-episodios`,
            `${BASE_URL}/animes/${cleanSlug}`
        ];

        let response;
        for (const url of urls) {
            try {
                response = await axios.get(url, { headers: HEADERS });
                if (response.status === 200) break;
            } catch (err) {
                continue;
            }
        }

        if (!response) throw new Error("Anime não encontrado");

        const $ = cheerio.load(response.data);

        const title = $(".div_anime_names .quicksand400").first().text().trim() || $("h1").text().trim() || slug;
        const poster = $(".sub_anime_page_img img").attr("data-src") || $(".sub_anime_page_img img").attr("src");
        const description = $(".divSinopse").text().replace("Sinopse:", "").trim();

        // Year extraction
        let year = "N/A";
        $(".animeInfo span").each((i, el) => {
            if ($(el).text().includes("Ano:")) {
                year = $(el)[0].nextSibling ? $(el)[0].nextSibling.nodeValue.trim() : "N/A";
            }
        });

        const genres = $(".spanGeneros, .spanGenerosLink").map((i, el) => $(el).text().trim()).get().filter(g => !/^[A-Z]\d+$/.test(g));

        const videos = [];
        const episodeLinks = $("a.lEp, .div_video_list a");

        episodeLinks.each((i, el) => {
            const epUrl = $(el).attr("href");
            if (!epUrl) return;

            const epParts = epUrl.split("/").filter(Boolean);
            const epNumber = epParts.pop(); // Usually the episode number

            const videoId = `${id}:${epNumber}`;
            const epTitle = $(el).text().trim() || `Episódio ${epNumber}`;

            videos.push({
                id: videoId,
                title: epTitle,
                released: new Date().toISOString(),
                episode: parseInt(epNumber) || i + 1,
                season: 1,
            });
        });

        const metaObj = {
            id, type: "anime", name: title, poster, background: poster,
            description, releaseInfo: year, genres, videos
        };

        metaCache.set(id, metaObj);
        return { meta: metaObj };
    } catch (e) {
        return { meta: { id, type, name: "Erro ao carregar meta" } };
    }
});

builder.defineStreamHandler(async ({ type, id }) => {
    // id format: af_slug:epNumber
    const cached = streamCache.get(id);
    if (cached) return { streams: cached };

    try {
        if (!id.includes(":")) return { streams: [] };

        const [animeId, epNumber] = id.split(":");
        // O sufixo -todos-os-episodios DEVE ser removido para o link do vídeo
        const animeSlug = animeId.replace("af_", "").replace("-todos-os-episodios", "");

        // Conforme descoberto, o AnimeFire tem uma API que retorna o JSON dos vídeos
        const url = `${BASE_URL}/video/${animeSlug}/${epNumber}?tempsubs=0`;

        const response = await axios.get(url, { headers: HEADERS });

        // A resposta é um JSON com { data: [ { src: '...', label: '...' } ] }
        if (response.data && response.data.data) {
            const streams = response.data.data.map(item => ({
                title: `🎬 AnimeFire (${item.label || 'HD'})`,
                url: item.src
            }));

            if (streams.length > 0) {
                streamCache.set(id, streams);
                return { streams };
            }
        }

        return { streams: [] };
    } catch (e) {
        console.error(`[AnimeFire] Erro no Scraper Stream: ${e.message}`);
        return { streams: [] };
    }
});

const addonInterface = builder.getInterface();

module.exports = { addonInterface };

if (require.main === module) {
    const port = process.env.PORT || 7000;
    serveHTTP(addonInterface, { port: port });

    process.on('uncaughtException', function (err) {
        console.error('CRITICAL ERROR:', err);
    });

    console.log(`🚀 AnimeFire Addon v1.3.0 funcional rodando na porta ${port}`);
    console.log(`👉 Manifesto: http://localhost:${port}/manifest.json`);
}
