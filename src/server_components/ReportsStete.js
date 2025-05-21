"use client";

import { makeAutoObservable } from "mobx";
import { nanoid } from "nanoid";
import { executeQuery } from "./database";

//Модель данных для колонки таблицы
class TableColumn {
  constructor(name, sqlName, type) {
    this.id = nanoid();
    this.name = name;
    this.sqlName = sqlName;
    this.type = type;
  }
}

//Модель данных для строки таблицы
// Модель данных для строки таблицы
class TableRow {
  constructor(values, editing = false) {
    this.id = nanoid();
    this.values = values.map(v => ({ id: nanoid(), value: v }));
    this.editing = editing;
    makeAutoObservable(this);
  }

  changeValue(id, value) {
    const index = this.values.findIndex(v => v.id === id);
    if (index !== -1) {
      this.values[index] = {id: id, value: value};
    }
  }

  setEdit(state){
    this.editing = state;
  }
}


//Модель данных для отчета
class Report {
  constructor(name, sqlQuery) {
    this.id = nanoid();
    this.name = name;
    this.sqlQuery = sqlQuery;
    this.columns = [];
    this.rows = [];
    this.isLoaded = false;
    makeAutoObservable(this);
  }

  //Устанавливает состояние загрузки
  setLoaded(state) {
    this.isLoaded = state;
  }

  //Выполняет запрос и обновляет данные
  async execute() {
    this.setLoaded(false);
    try {
      const data = await executeQuery(this.sqlQuery);
      this.columns = data.map(
        (row) =>
          new TableColumn(
            Object.keys(row)[0],
            Object.keys(row)[0],
            typeof row[Object.keys(row)[0]]
          )
      );
      this.rows = data.map((row) => new TableRow(Object.values(row)));
      this.setLoaded(true);
    } catch (error) {
      console.error("Ошибка при выполнении запроса:", error);
      this.setLoaded(true);
      throw error;
    }
  }

  // Геттеры для удобного доступа к данным
  get columnNames() {
    if (!this.rows.length || !this.columns.length) return [];
    return this.columns.map((col) => col.name);
  }

  get sqlColumnNames() {
    if (!this.rows.length || !this.columns.length) return [];
    return this.columns.map((col) => col.sqlName);
  }

  get columnTypes() {
    if (!this.rows.length || !this.columns.length) return [];
    return this.columns.map((col) => col.type);
  }

  get hasData() {
    return this.rows.length > 0 && this.columns.length > 0;
  }
}

//Состояние отчетов
class ReportsState {
  constructor() {
    this.reports = [];
    makeAutoObservable(this);
  }

  //Добавляет новый отчет
  addReport(name, sqlQuery) {
    this.reports.push(new Report(name, sqlQuery));
  }

  //Геттеры для удобного доступа к отчетам
  get reportNames() {
    return this.reports.map((report) => report.name);
  }
}

export default new ReportsState();
