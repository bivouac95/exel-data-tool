"use client";

import { makeAutoObservable } from "mobx";
import { nanoid } from "nanoid";
import {
  parseDocument,
  parseColumnNames,
  parseColumnTypes,
  createTable,
  insertRows,
  insertRow,
  getData,
  clearTable,
  updateRow,
} from "./database";

class TableColumn {
  constructor(name, sqlName, type) {
    this.id = nanoid();
    this.name = name;
    this.sqlName = sqlName;
    this.type = type;
    makeAutoObservable(this);
  }
}

class TableRow {
  constructor(values, editing = false) {
    this.id = nanoid();
    this.values = values.map((v) => ({ id: nanoid(), value: v }));
    this.editing = editing;
    makeAutoObservable(this);
  }

  changeValue(id, value) {
    const index = this.values.findIndex((v) => v.id === id);
    if (index !== -1) {
      this.values[index] = { id, value };
    }
  }

  setEdit(state) {
    this.editing = state;
  }
}

class InitialDataState {
  constructor() {
    this.jsonData = [];
    this.rows = new Map();
    this.rowOrder = [];
    this.columns = [];
    this.isLoaded = false;
    this.isLoading = false;
    this.beingEdited = false;
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

  // Data initialization
  async handleDocumentUpload(file) {
    if (!file) return;

    try {
      this.startLoading();
      const json = await parseDocument(file);
      this.jsonData = json;

      await this.initializeColumns(json);
      this.initializeRows(json);
      await this.createTableSQL();

      this.finishLoading();
    } catch (error) {
      console.error("Document processing error:", error);
      this.finishLoading();
      throw error;
    }
  }

  async initializeColumns(json) {
    if (!json.length) return;

    const columnNames = Object.keys(json[0]);
    const sqlNames = await parseColumnNames(columnNames);
    const columnTypes = await parseColumnTypes(Object.values(json[0]));

    this.columns = columnNames.map(
      (name, i) => new TableColumn(name, sqlNames[i], columnTypes[i])
    );
  }

  initializeRows(json) {
    this.rows.clear();
    this.rowOrder = json.map((row) => {
      const tr = new TableRow(Object.values(row));
      this.rows.set(tr.id, tr);
      return tr.id;
    });
  }

  // Row operations
  addNewRow() {
    const newRow = new TableRow(
      this.columns.map(() => ""),
      true
    );
    this.rows.set(newRow.id, newRow);
    this.rowOrder = [newRow.id, ...this.rowOrder];
    this.beingEdited = true;
  }

  deleteRow(rowId) {
    this.rows.delete(rowId);
    this.rowOrder = this.rowOrder.filter((id) => id !== rowId);
    this.updateTableSQL();
  }

  stopEdit(cancel = false) {
    if (cancel) {
      const keep = [];
      for (const id of this.rowOrder) {
        const r = this.rows.get(id);
        if (r.editing) this.rows.delete(id);
        else keep.push(id);
      }
      this.rowOrder = keep;
    } else {
      const editingId = this.rowOrder.find((id) => this.rows.get(id).editing);
      if (editingId) {
        const row = this.rows.get(editingId);
        insertRow(
          [row.id, ...row.values.map((v) => v.value)],
          ["id", ...this.columns.map((c) => c.sqlName)]
        );
        row.setEdit(false);
      }
    }
    this.beingEdited = false;
  }

  // Database operations
  async createTableSQL() {
    await createTable(this.sqlColumnNames, this.columnTypes);
    await insertRows(this.rowValuesWithIds, ["id", ...this.sqlColumnNames]);
  }

  async updateTableSQL() {
    await clearTable();
    insertRows(this.rowValuesWithIds, ["id", ...this.sqlColumnNames]);
  }

  async updateRowSQL(rowId) {
    const row = this.rows.get(rowId);
    if (row && !row.editing) {
      await updateRow(
        rowId,
        row.values.map((v) => v.value),
        this.sqlColumnNames
      );
    }
  }

  async getSQLData() {
    console.log(await getData());
  }

  // Getters
  get sqlColumnNames() {
    return this.columns.map((col) => col.sqlName);
  }

  get columnTypes() {
    return this.columns.map((col) => col.type);
  }


  get rowValuesWithIds() {
    return this.rowOrder.map((id) => {
      const row = this.rows.get(id);
      return [id, ...row.values.map((v) => v.value)];
    });
  }
}

export default new InitialDataState();
