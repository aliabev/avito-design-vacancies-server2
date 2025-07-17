const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
// используем либо переданный Railway/Vercel/Render порт, либо 8080
const PORT = process.env.PORT || 8080;

app.get('/vacancies', async (_, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox','--disable-setuid-sandbox'],
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(
      'https://career.avito.com/vacancies/dizayn/?q=&action=filter&direction=dizayn&tags%5B%5D=s26531',
      { waitUntil: 'networkidle2' }
    );

    // ждём, пока карточки вакансий отрисуются
    await page.waitForSelector('.vacancy-card__title a', { timeout: 5000 });

    // собираем title и url у каждой вакансии
    const vacancies = await page.$$eval('.vacancy-card__title a', anchors =>
      anchors.map(a => ({
        title: a.textContent.trim(),
        url: a.href
      }))
    );

    res.json({ vacancies });
  } catch (err) {
    console.error('Ошибка при получении вакансий:', err);
    res.status(500).send('Ошибка при получении вакансий');
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`✅ Vacancies API running on port ${PORT}`);
});
