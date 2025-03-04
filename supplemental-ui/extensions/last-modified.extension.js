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
      console.log("🔍 Injecting last updated timestamps...");
      contentCatalog.getFiles().forEach((file) => {
          console.log(`🔎 Checking file: ${file.src.relative}`);

          let relativePath = file.src.relative.replace(/^docs\//, "");

          const entry = this.lastModifiedData.find((item) => item.file === relativePath);
          if (entry) {
              let lastUpdated = new Date(entry.timestamp * 1000).toISOString();
              file.asciidoc.attributes["last-updated"] = lastUpdated;
              console.log(`✅ Set last-updated for ${file.src.relative}: ${lastUpdated}`);
          } else {
              console.log(`⚠️ No last-updated found for ${file.src.relative}`);
          }
      });
  }
}

module.exports = LastModifiedExtension;
