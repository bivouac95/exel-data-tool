"use client";

import { makeAutoObservable } from "mobx";
import { nanoid } from "nanoid";
import {
  getReportData,
  asyncTransliterate,
  createReport,
  deleteTable,
  getTables,
  getBetterColumns,
  insertColumns,
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

  initializeColums(criteria) {
    for (let c of criteria) {
      this.columns.push(new TableColumn(c.name, c.sqlName));
    }
  }

  clear() {
    this.rowOrder = [];
    this.rows.clear();
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
  constructor(name, id = null) {
    this.id = id ? id : nanoid();
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
    await createReport(sql, this.id, this.sqlName, this.name);

    await insertColumns(
      this.tableState.columns.map((c) => [
        c.id,
        c.sqlName,
        c.name,
        this.sqlName,
      ])
    );
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
    this.tableState.initializeColums(criteria, this.sqlName);
    await this.createSQL(criteria);
    const rows = await getReportData(this.sqlName);
    this.tableState.initializeRows(rows);
    this.tableState.finishLoading();

    return Array.from(this.tableState.rows.values());
  }

  async updateData() {
    this.tableState.startLoading();
    this.tableState.clear();
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
    await deleteTable(report.sqlName);
    this.reports = this.reports.filter((r) => r.id !== id);
  }

  async loadSQLData() {
    const reports = (await getTables()).filter((t) => t.type == "report");
    for (let r of reports) {
      const report = new Report(r.readable_name, r.id);
      report.sqlName = r.name;
      report.tableState.initializeColums(
        await getBetterColumns(report.sqlName)
      );
      report.updateData();

      this.reports.push(report);
    }
  }
}

export default new ReportsStete();
