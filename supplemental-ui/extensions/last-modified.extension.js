"use strict";
const fs = require("fs");
const path = require("path");

class LastModifiedExtension {
  static register({ config }) {
    console.log("Registering LastModifiedExtension");
    new LastModifiedExtension(config);
  }

  constructor(config) {
    this.config = config;
    this.dbFile = path.resolve(__dirname, "../../../last_modified.json");
    this.lastModifiedData = this.loadLastModifiedData();
  }

  loadLastModifiedData() {
    if (fs.existsSync(this.dbFile)) {
      return JSON.parse(fs.readFileSync(this.dbFile, "utf8"));
    }
    return [];
  }

  async onContentClassified({ contentCatalog }) {
    console.log("Injecting last updated timestamps...");
    contentCatalog.getFiles().forEach((file) => {
      // Очищаємо "docs/" з початку шляху (якщо воно є)
      let relativePath = file.src.relative.replace(/^docs\//, "");

      // Шукаємо запис у last_modified.json
      const entry = this.lastModifiedData.find((item) => item.file === relativePath);
      if (entry) {
        file.asciidoc.attributes["last-updated"] = new Date(entry.timestamp * 1000).toISOString();
        console.log(`✅ Set last-updated for ${file.src.relative}: ${file.asciidoc.attributes["last-updated"]}`);
      } else {
        console.log(`⚠️ No last-updated found for ${file.src.relative}`);
      }
    });
  }
}

module.exports = LastModifiedExtension;
