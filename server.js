const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const app = express();
// Railway подставит свою переменную PORT автоматически.
// В локале fallback на 3000
const PORT = process.env.PORT || 3000;

app.get("/vacancies", async (req, res) => {
  try {
    // Получаем HTML страницы Авито
    const response = await fetch(
      "https://career.avito.com/vacancies/dizayn/?q=&action=filter&direction=dizayn&tags%5B%5D=s26531"
    );
    const html = await response.text();

    // Загружаем Cheerio
    const $ = cheerio.load(html);

    // Выбираем все элементы вакансий
    const vacancies = [];
    $('[data-qa="vacancy-item"] a').each((_, el) => {
      vacancies.push({
        title: $(el).text().trim(),
        url: $(el).attr("href")
      });
    });

    res.json({ vacancies });
  } catch (error) {
    console.error("Ошибка при получении вакансий:", error);
    res.status(500).send("Ошибка при получении вакансий");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Vacancies API running on port ${PORT}`);
});
