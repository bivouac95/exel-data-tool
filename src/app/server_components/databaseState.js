"use client";

import { makeAutoObservable } from "mobx";
import { parseDocument, parseColumnNames, parseColumnTypes } from "./database";

class DatabaseState {
  tableRows = {};
  jsonData = [];
  tableNames = {};
  tableTypes = [];
  isLoaded = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setLoaded(state) {
    this.isLoaded = state;
  }

  async handleDocumentUpload(file) {
    if (!file) return;
    this.setLoaded(false);
    const json = await parseDocument(file);
    this.jsonData = json;
    this.tableRows = json
      .slice(1)
      .map((row) => Object.values(row))
      .reduce((object, row, index) => {
        object[index] = row;
        return object;
      }, {});
    this.tableNames = Object.keys(json[0]);
    this.setLoaded(true);
    console.log("Удачно");
  }
}

export default new DatabaseState();
