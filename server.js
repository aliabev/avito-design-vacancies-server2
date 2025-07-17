// server.js
const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/vacancies', async (_req, res) => {
  try {
    // Достаём HTML страницы вакансий
    const resp = await fetch('https://career.avito.com/vacancies/dizayn', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await resp.text();

    // Парсим через cheerio
    const $ = cheerio.load(html);
    const vacancies = [];

    // Выбираем все <a> внутри data-qa="vacancy-item"
    $('[data-qa="vacancy-item"] a').each((_, el) => {
      const link = $(el);
      const title = link.text().trim();
      let url = link.attr('href') || '';
      // Если URL относительный, дополняем доменом
      if (url.startsWith('/')) {
        url = 'https://career.avito.com' + url;
      }
      vacancies.push({ title, url });
    });

    res.json({ vacancies });
  } catch (err) {
    console.error('Ошибка при получении вакансий:', err);
    res.status(500).send('Ошибка при получении вакансий');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Vacancies API listening on port ${PORT}`);
});
