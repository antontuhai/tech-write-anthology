document.addEventListener("DOMContentLoaded", function () {
  console.log("📢 Site.js is running...");

  let article = document.querySelector(".doc");
  if (!article) {
    console.warn("⚠️ Article (.doc) not found!");
    return;
  }

  // Клонування статті для очищення від зайвих елементів
  let clonedArticle = article.cloneNode(true);

  // Видаляємо зміст (TOC), якщо він є
  let toc = clonedArticle.querySelector(".toc, #toc"); // Шукаємо TOC за класом або ID
  if (toc) toc.remove();

  // Видаляємо зображення, діаграми, короткі посилання, але залишаємо кодові блоки
  clonedArticle.querySelectorAll("img, svg, object, iframe").forEach(el => el.remove());
  clonedArticle.querySelectorAll("[src$='.puml'], [href$='.puml']").forEach(el => el.remove());
  clonedArticle.querySelectorAll("a").forEach(link => {
    if (link.innerText.trim().length < 15) link.remove();
  });

  // Включаємо admonitions у підрахунок
  let admonitions = article.querySelectorAll(".admonitionblock");
  let admonitionText = Array.from(admonitions).map(block => block.innerText.trim()).join(" ");

  // Отримуємо весь текст, включаючи кодові блоки, таблиці та admonitions
  let textContent = (clonedArticle.innerText + " " + admonitionText).trim();
  let words = textContent.split(/\s+/).filter(word => word.length > 1).length;

  // Визначаємо середню довжину речень
  let sentences = textContent.split(/[.!?]+/).length;
  let avgWordsPerSentence = words / sentences || 1;

  // Визначаємо середню довжину слова (довші слова означають технічний текст)
  let avgWordLength = textContent.length / words || 5;
  let isHighlyTechnical = avgWordLength > 6;

  // Визначаємо кількість кодових блоків і таблиць
  let codeBlocks = article.querySelectorAll("pre, code").length;
  let tables = article.querySelectorAll("table").length;

  // **Оновлена логіка швидкості читання**
  let readingSpeed = 200; // Базова швидкість для технічного тексту

  if (avgWordsPerSentence > 20) readingSpeed = 150; // Довгі речення → повільніше
  if (avgWordsPerSentence < 10) readingSpeed = 220; // Короткі речення → швидше

  if (isHighlyTechnical) readingSpeed *= 0.85; // Якщо текст дуже технічний → ще повільніше

  // **Зменшуємо швидкість читання для admonitions (важливий контент)**
  if (admonitions.length > 0) readingSpeed *= 0.9;

  // **Зменшуємо швидкість читання для кодових блоків і таблиць (аналізуємо, а не просто читаємо)**
  if (codeBlocks > 0) readingSpeed *= 0.8; // Код читається на 20% повільніше
  if (tables > 0) readingSpeed *= 0.85; // Таблиці аналізуються довше

  let readingTime;

  // **Адаптивний розрахунок часу**
  if (words < 20) {
    readingTime = "10 sec";
  } else if (words < 100) {
    readingTime = "40 sec";
  } else {
    readingTime = Math.min(Math.ceil(words / readingSpeed), 20); // ❗ Обмеження max 20 хв
    readingTime = readingTime < 1 ? "40 sec" : `${readingTime} min`;
  }

  // Створення блоку для часу читання
  let timeContainer = document.createElement("div");
  timeContainer.className = "reading-time";
  timeContainer.innerHTML = `⏳ Read time: ${readingTime}`;

  // Додається під заголовком сторінки
  let header = document.querySelector(".doc > h1");
  if (header) {
    header.insertAdjacentElement("afterend", timeContainer);
  }

  console.log(`✅ Read time added: ${readingTime}`);
});