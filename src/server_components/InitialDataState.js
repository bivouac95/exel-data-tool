"use client";

import { makeAutoObservable } from "mobx";
import {
  parseDocument,
  parseColumnNames,
  parseColumnTypes,
  createTable,
  insertRows,
  insertRow,
  getData,
  clearTable,
} from "./database";
import { nanoid } from "nanoid";

// Модель данных для колонки таблицы
class TableColumn {
  constructor(name, sqlName, type) {
    this.id = nanoid();
    this.name = name;
    this.sqlName = sqlName;
    this.type = type;
    makeAutoObservable(this);
  }
}

// Модель данных для строки таблицы
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
      this.values[index] = { id: id, value: value };
    }
  }

  setEdit(state) {
    this.editing = state;
  }
}

// Главный стор для работы с табличными данными
class InitialDataState {
  constructor() {
    this.jsonData = [];
    this.rows = [];
    this.columns = [];
    this.isLoaded = false;
    this.isLoading = false;
    this.beingEdited = false;
    makeAutoObservable(this);
  }

  // Устанавливает состояние загрузки
  startLoading() {
    this.isLoaded = false;
    this.isLoading = true;
  }

  finishLoading() {
    this.isLoading = false;
    this.isLoaded = true;
  }

  // Обрабатывает загруженный файл с данными
  async handleDocumentUpload(file) {
    if (!file) return;
    try {
      this.startLoading();

      // Парсим файл и получаем сырые данные
      const json = await parseDocument(file);
      this.jsonData = json;

      // Инициализируем структуры данных
      await this.initializeColumns(json);
      this.initializeRows(json);

      //Создаем таблицу в базе данных
      await this.createTableSQL();

      this.finishLoading();
      console.log("Данные успешно загружены и обработаны");
    } catch (error) {
      console.error("Ошибка при обработке файла:", error);
      this.finishLoading();
      throw error;
    }
  }

  //Добавляет новую строку
  addNewRow() {
    this.rows = [
      new TableRow(
        this.columns.map(() => ""),
        true
      ),
      ...this.rows,
    ];
    this.beingEdited = true;
  }

  //Удаляет строку
  deleteRow(row) {
    this.rows = this.rows.filter((r) => r.id !== row.id);
    this.updateTableSQL();
  }

  //Изменить статус редактирования
  stopEdit(cancel = false) {
    if (cancel) {
      this.rows = this.rows.filter((r) => !r.editing);
    } else {
      insertRow(
        this.rows.filter((r) => r.editing)[0].values.map((v) => v.value),
        this.columns.map((c) => c.sqlName)
      );
      this.rows.forEach((r) => (r.editing = false));
    }

    this.beingEdited = false;
  }

  // Создает таблицу в базе данных
  async createTableSQL() {
    await createTable(this.sqlColumnNames, this.columnTypes);
    await insertRows(this.rowValues, this.sqlColumnNames);
  }

  //Обновить таблицу в базе данных
  async updateTableSQL() {
    await clearTable();
    insertRows(this.rowValues, this.sqlColumnNames);
  }

  //Обновить строку в базе данных
  async updateRowSQL(rowId) {
    const row = this.rows.find((r) => r.id === rowId);
    if (!row.editing) {
      await clearTable();
      insertRow(
        row.values.map((v) => v.value),
        this.sqlColumnNames
      );
      console.log("Row updated");
    }
  }

  //Геттеры для удобства
  get sqlColumnNames() {
    return this.columns.map((col) => col.sqlName);
  }

  get columnTypes() {
    return this.columns.map((col) => col.type);
  }

  get rowValues() {
    return this.rows.map((row) => row.values.map((v) => v.value));
  }

  // Вспомогательные методы
  async initializeColumns(json) {
    if (!json.length) return;

    const columnNames = Object.keys(json[0]);
    const sqlNames = await parseColumnNames(columnNames);
    const columnTypes = await parseColumnTypes(Object.values(json[0]));

    let res = [];
    for (let i = 0; i < columnNames.length; i++) {
      res.push(new TableColumn(columnNames[i], sqlNames[i], columnTypes[i]));
    }

    this.columns = res;
  }

  initializeRows(json) {
    this.rows = json.map((row) => new TableRow(Object.values(row)));
  }
}

// Экспортируем singleton-экземпляр стора
export default new InitialDataState();
