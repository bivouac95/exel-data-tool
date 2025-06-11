"use client";

import { makeAutoObservable } from "mobx";
import { nanoid } from "nanoid";
import {
  getColumns,
  createSearchQuery,
  getReportData,
  parseColumnNames,
  asyncTransliterate,
  createReport,
  deleteTable,
  createColumn,
} from "./database";

class TableColumn {
  constructor(name, sqlName) {
    this.id = nanoid();
    this.name = name;
    this.sqlName = sqlName;
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
      const tableRow = new TableRow(values);
      this.rows.set(tableRow.id, tableRow);
      this.rowOrder.push(tableRow.id);
    }
  }

  initializeColums(criteria, name) {
    for (let c of criteria) {
      this.columns.push(new TableColumn(c.name, c.sqlName));
    }

    for (let c of this.columns) {
      createColumn(c.id, name, c.name, c.sqlName);
    }
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

class Report {
  constructor(name) {
    this.id = nanoid();
    this.name = name;
    this.sqlName = "";
    this.sqlQuery = "";
    this.tableState = new TableState();
  }

  async createSQL(criteria) {
    const fromSet = new Set();
    let queryList = [];
    for (let c of criteria) {
      if (c.table && c.table !== "") {
        fromSet.add(c.table);
        queryList.push(c.sqlQuery);
      } else {
        queryList.push("(SELECT " + c.sqlQuery + ") AS " + c.sqlName);
      }
    }
    const fromList = Array.from(fromSet);
    let sql = `CREATE VIEW ${this.sqlName} AS SELECT ` + queryList.join(", ");
    if (fromList.length > 0) {
      sql += ` FROM ${fromList.join(", ")}`;
    }
    console.log(sql);
    await createReport(sql, this.id, this.sqlName, this.name);
  }

  // const criteria = {
  //   name: column.name,
  //   table: column.tableName,
  //   sqlName: column.sqlName,
  //   sqlQuery: column.sqlQuery,
  // };
  async init(criteria) {
    this.tableState.startLoading();
    this.sqlName = await asyncTransliterate(this.name);
    await this.createSQL(criteria);
    this.tableState.initializeColums(criteria, this.sqlName);
    const rows = await getReportData(this.sqlName);
    this.tableState.initializeRows(rows);
    this.tableState.finishLoading();

    return Array.from(this.tableState.rows.values());
  }

  async updateData() {
    this.tableState.startLoading();
    this.tableState.rowOrder = [];
    this.tableState.rows.clear();
    this.tableState.initializeRows(await getReportData(this.sqlName));
    this.tableState.finishLoading();
  }
}

class ReportsStete {
  constructor() {
    this.reports = [];
    makeAutoObservable(this);
  }

  async addReport(name, criteria) {
    const report = new Report(name);
    await report.init(criteria);
    this.reports.push(report);
    return report;
  }

  async deleteReport(id) {
    const report = this.reports.find((r) => r.id === id);
    deleteTable(report.sqlName);
    this.reports = this.reports.filter((r) => r.id !== id);
  }
}

export default new ReportsStete();
