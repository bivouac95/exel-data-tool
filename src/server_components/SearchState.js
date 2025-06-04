"use client";

import { makeAutoObservable } from "mobx";
import { nanoid } from "nanoid";
import {
  getColumns,
  createSearchQuery,
  getReportData,
  parseColumnNames,
  deleteTable,
} from "./database";

class TableColumn {
  constructor(name, sqlName, type) {
    this.id = nanoid();
    this.name = name;
    this.sqlName = sqlName;
    this.type = type;
  }
}

class TableRow {
  constructor(values) {
    this.id = nanoid();
    this.values = values.map((v) => ({ id: nanoid(), value: v }));
  }
}

class TableState {
  constructor() {
    this.rows = new Map();
    this.rowOrder = [];
    this.columns = [];
    this.isLoaded = false;
    this.isLoading = false;
    makeAutoObservable(this);
  }

  // Loading state management
  startLoading() {
    this.isLoaded = false;
    this.isLoading = true;
  }

  finishLoading() {
    this.isLoading = false;
    this.isLoaded = true;
  }

  initializeRows(data) {
    for (let row of data) {
      let values = Object.values(row);
      values.shift();
      const tableRow = new TableRow(values);
      this.rows.set(tableRow.id, tableRow);
      this.rowOrder.push(tableRow.id);
    }
  }

  initializeColums(columns) {
    this.columns = columns.map((c) => {
      return new TableColumn(c.name, c.sqlName, c.type);
    });
  }

  get jsonData() {
    const objectKeys = this.columns.map((c) => c.name);
    let result = [];
    for (let id of this.rowOrder) {
      const row = this.rows.get(id);
      const values = row.values.map((v) => v.value);
      let obj = {};
      for (let i = 0; i < objectKeys.length; i++) {
        obj[objectKeys[i]] = values[i];
      }
      result.push(obj);
    }
    return result;
  }
}

class SearchQuery {
  constructor(name, sqlName, key, criteria) {
    this.id = nanoid();
    this.name = name;
    this.sqlName = sqlName;

    this.columns = criteria.columns;
    this.searchKey = key;
    this.regex = criteria.regex;
    this.tableName = criteria.tableName;

    this.tableState = new TableState();
    makeAutoObservable(this);
  }

  async createSQL() {
    const key = this.searchKey.replace(/'/g, "''");

    const predicates = this.columns.map((col) => {
      const casted = `CAST(${col} AS TEXT)`; // или AS CHAR
      if (this.regex) {
        return `${casted} REGEXP '${key}'`;
      } else {
        return `${casted} LIKE '%${key}%'`;
      }
    });

    const query = predicates.join(" OR ");
    console.log("Generated SQL WHERE:", query); // для дебага

    await createSearchQuery(query, this.tableName, this.id, this.sqlName);
  }

  async init(columns) {
    this.tableState.startLoading();
    await this.createSQL();
    this.tableState.initializeColums(columns);
    const rows = await getReportData(this.sqlName);
    this.tableState.initializeRows(rows);
    this.tableState.finishLoading();
  }

  async updateData() {
    this.tableState.startLoading();
    this.tableState.rowOrder = [];
    this.tableState.rows.clear();
    this.tableState.initializeRows(await getReportData(this.sqlName));
    this.tableState.finishLoading();
  }
}

class SearchState {
  constructor() {
    this.searchQueries = new Map();
    makeAutoObservable(this);
  }

  async addSearchQuery(searchKey, criteria, columns) {
    const newQuery = new SearchQuery(
      "Поиск " + this.searchQueries.size,
      "search_" + this.searchQueries.size,
      searchKey,
      criteria
    );
    this.searchQueries.set(newQuery.id, newQuery);
    await newQuery.init(columns);
    return newQuery;
  }

  async deleteSearchQuery(id) {
    deleteTable(this.searchQueries.get(id).sqlName);
    this.searchQueries.delete(id);
  }
}

export default new SearchState();
