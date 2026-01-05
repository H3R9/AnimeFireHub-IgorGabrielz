const axios = require('axios');
const cheerio = require('cheerio');

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://google.com.br/",
    "Origin": "https://animefire.io",
    "Connection": "keep-alive"
};

async function test() {
    const url = 'https://animefire.io/animes/ore-dake-level-up-na-ken-todos-os-episodios';
    console.log(`Buscando Meta: ${url}`);
    try {
        const response = await axios.get(url, { headers: HEADERS });
        console.log('Status:', response.status);
        const $ = cheerio.load(response.data);

        const title = $(".div_anime_names .quicksand400").first().text().trim() || $("h1").text().trim();
        const description = $(".divSinopse").text().replace("Sinopse:", "").trim();
        const genres = $(".spanGeneros").map((i, el) => $(el).text().trim()).get();
        const episodes = $("a.lEp").length;

        console.log('Title:', title);
        console.log('Description Length:', description.length);
        console.log('Genres:', genres.join(", "));
        console.log('Episodes found:', episodes);

        if (episodes === 0) {
            console.log('HTML Snippet:', response.data.substring(0, 1000));
        }
    } catch (e) {
        console.error('Erro:', e.message);
        if (e.response) {
            console.error('Status Erro:', e.response.status);
        }
    }
}

test();
