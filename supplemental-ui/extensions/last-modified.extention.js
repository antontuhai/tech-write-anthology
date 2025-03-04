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
      const entry = this.lastModifiedData.find((item) => item.file === file.src.relative);
      if (entry) {
        file.asciidoc.attributes["last-updated"] = new Date(entry.timestamp * 1000).toISOString();
      }
    });
  }
}

module.exports = LastModifiedExtension;
