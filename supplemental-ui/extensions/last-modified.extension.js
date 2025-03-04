"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class LastModifiedExtension {
  static register({ config }) {
    if (global.__LAST_MODIFIED_REGISTERED__) {
      return;
    }
    global.__LAST_MODIFIED_REGISTERED__ = true;

    console.log("✅ Registering LastModifiedExtension");
    new LastModifiedExtension(config);
  }

  constructor(config) {
    this.config = config;

    // Визначаємо корінь проєкту через Git
    let projectRoot;
    try {
      projectRoot = execSync("git rev-parse --show-toplevel").toString().trim();
      console.log(`📂 Detected project root: ${projectRoot}`);
    } catch (error) {
      console.error("❌ Failed to detect project root, using default.");
      projectRoot = path.resolve(__dirname, "../../..");
    }

    this.dbFile = path.join(projectRoot, "last_modified.json");
    console.log(`📄 Looking for last_modified.json at: ${this.dbFile}`);
    this.lastModifiedData = this.loadLastModifiedData();
  }

  loadLastModifiedData() {
    if (fs.existsSync(this.dbFile)) {
      console.log(`📂 Loaded last_modified.json`);
      return JSON.parse(fs.readFileSync(this.dbFile, "utf8"));
    }
    console.log(`❌ last_modified.json not found at ${this.dbFile}`);
    return [];
  }

  async onContentClassified({ contentCatalog }) {
      console.log("🔍 Injecting last updated timestamps...");

      const files = contentCatalog.getFiles();
      console.log(`📂 Found ${files.length} files in content catalog`);

      files.forEach((file) => {
          console.log(`🔎 Checking file: ${file.src.relative}`);

          let relativePath = file.src.relative.replace(/^docs\//, "").replace(/^.\//, "");

          console.log(`🛠 Normalized path: ${relativePath}`);

          const entry = this.lastModifiedData.find((item) => item.file === relativePath);

          if (entry) {
              let lastUpdated = new Date(entry.timestamp * 1000).toISOString();
              file.asciidoc.attributes["last-updated"] = lastUpdated;
              console.log(`✅ Set last-updated for ${file.src.relative}: ${lastUpdated}`);
          } else {
              console.log(`⚠️ No last-updated found for ${file.src.relative}`);
          }
      });

      console.log("📄 Content classification finished.");
  }

}

module.exports = LastModifiedExtension;