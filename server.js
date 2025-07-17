// server.js
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
// Railway/Vercel/Render прокидывают PORT, а локально будет 8080
const PORT = process.env.PORT || 8080;

app.get('/vacancies', async (_req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto('https://career.avito.com/vacancies/dizayn', {
      waitUntil: 'networkidle2'
    });

    // даём React-е и fetch-запросам подгрузиться
    await page.waitForTimeout(3000);

    // собираем все ссылки, в href которых есть "/vacancies/",
    // и фильтруем по регулярке, чтобы получить только карточки
    const vacancies = await page.$$eval('a[href*="/vacancies/"]', links =>
      links
        .filter(a => {
          try {
            // вытащить путь из URL
            const path = new URL(a.href).pathname;
            // должен выглядеть как "/vacancies/что-то-русскими-и-англ-буквами"
            return /^\/vacancies\/[A-Za-z0-9\-_%]+$/.test(path);
          } catch {
            return false;
          }
        })
        .map(a => ({
          title: a.textContent.trim(),
          url: a.href
        }))
    );

    res.json({ vacancies });
  } catch (err) {
    console.error('❌ Ошибка при получении вакансий:', err);
    res.status(500).send('Ошибка при получении вакансий');
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`✅ Vacancies API running on port ${PORT}`);
});
