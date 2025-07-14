const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/vacancies", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
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
    console.error("Ошибка:", error);
    res.status(500).send("Ошибка при получении вакансий");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Vacancies API running on http://localhost:${PORT}`);
});
