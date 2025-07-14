// src/server.js или корень проекта, как у тебя лежит
const express = require("express");
const puppeteer = require("puppeteer-core");  // вместо sparticuz
const app = express();

// Railway и подобные платформы задают PORT в env — для локалки используем 8000
const PORT = process.env.PORT || 8000;

app.get("/vacancies", async (req, res) => {
  try {
    // в контейнере Chromium должен быть установлен системно
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: process.env.CHROME_PATH || "/usr/bin/chromium-browser",
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(
      "https://career.avito.com/vacancies/dizayn/?q=&action=filter&direction=dizayn&tags%5B%5D=s26531",
      { waitUntil: "domcontentloaded" }
    );

    const vacancies = await page.$$eval('[data-qa="vacancy-item"] a', (links) =>
      links.map((link) => ({
        title: link.textContent.trim(),
        url: link.href,
      }))
    );

    await browser.close();
    res.json({ vacancies });
  } catch (error) {
    console.error("Ошибка при получении вакансий:", error);
    res.status(500).send("Ошибка при получении вакансий");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Vacancies API running on port ${PORT}`);
});
