const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/vacancies", async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true
    });

    const page = await browser.newPage();
    await page.goto("https://career.avito.com/vacancies/dizayn/", {
      waitUntil: "networkidle2"
    });

    const vacancies = await page.$$eval(
      ".vacancies-section__item",
      items =>
        items.map(item => {
          // ссылка
          const linkEl = item.querySelector("a.vacancies-section__item-link");
          const href = linkEl?.getAttribute("href") || "";
          const url = href.startsWith("http")
            ? href
            : `https://career.avito.com${href}`;

          // заголовок
          const titleEl = item.querySelector(".vacancies-section__item-content");
          const title = titleEl?.textContent.trim() || "";

          return { title, url };
        })
    );

    res.json({ vacancies });
  } catch (error) {
    console.error("Ошибка при получении вакансий:", error);
    res.status(500).send("Ошибка при получении вакансий");
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`✅ Vacancies API running on port ${PORT}`);
});
