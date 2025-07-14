const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const app = express();
const PORT = process.env.PORT || 8080;

// Проверочный корневой роутинг
app.get("/", (req, res) => {
  res.send("✅ Avito Design Vacancies API работает");
});

app.get("/vacancies", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();
    await page.goto("https://career.avito.com/vacancies/dizayn/?q=&action=filter&direction=dizayn&tags%5B%5D=s26531", {
      waitUntil: "domcontentloaded"
    });

    const vacancies = await page.$$eval('[data-qa="vacancy-item"] a', links =>
      links.map(link => ({
        title: link.textContent.trim(),
        url: link.href
      }))
    );

    await browser.close();
    res.json({ vacancies });
  } catch (error) {
    console.error("Ошибка при парсинге:", error);
    res.status(500).send("Ошибка при получении вакансий");
  }
});

app.listen(PORT, () => {
  console.log(`✅ API работает на http://localhost:${PORT}`);
});
