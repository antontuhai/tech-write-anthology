document.addEventListener("DOMContentLoaded", async function () {
    const pagePath = window.location.pathname.replace(/\/$/, ""); // Видаляємо кінцевий слеш, якщо є
    console.log(`🔍 Fetching last modified date for: ${pagePath}`);

    try {
        const response = await fetch("/last_modified.json");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const lastModifiedData = await response.json();
        console.log("📂 Loaded last_modified.json", lastModifiedData);

        // Знайдемо відповідний запис для сторінки
        const matchingEntry = lastModifiedData.find(entry => {
            return pagePath.endsWith(entry.file);
        });

        if (matchingEntry) {
            const lastUpdated = new Date(matchingEntry.timestamp * 1000).toLocaleString();
            console.log(`✅ Last updated: ${lastUpdated}`);

            // Вставляємо дату у HTML
            const targetElement = document.querySelector("#last-updated");
            if (targetElement) {
                targetElement.innerHTML = `Last updated: ${lastUpdated}`;
            }
        } else {
            console.log("⚠️ No matching entry found for this page.");
        }
    } catch (error) {
        console.error("❌ Error fetching last_modified.json:", error);
    }
});
