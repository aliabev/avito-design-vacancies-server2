// server.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/vacancies", async (req, res) => {
  try {
    // 1) Скачиваем HTML страницы
    const { data: html } = await axios.get(
      "https://career.avito.com/vacancies/dizayn/?q=&action=filter&direction=dizayn&tags%5B%5D=s26531"
    );

    // 2) Загружаем в cheerio
    const $ = cheerio.load(html);

    const vacancies = [];

    // 3) Ищем все ссылки с классом .vacancies-section__item-link
    $(".vacancies-section__item-link").each((_, el) => {
      const href = $(el).attr("href");
      // внутри тега <a> может быть текст или вложенный элемент с заголовком
      const title = $(el).text().trim();

      if (href && title) {
        vacancies.push({
          title,
          url: "https://career.avito.com" + href
        });
      }
    });

    res.json({ vacancies });
  } catch (error) {
    console.error("Ошибка при получении вакансий:", error.message);
    res.status(500).send("Ошибка при получении вакансий");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Vacancies API running on port ${PORT}`);
});
