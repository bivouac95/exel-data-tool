"use client";

import { makeAutoObservable } from "mobx";
import { parseDocument, parseColumnNames, parseColumnTypes, createTable, insertRows } from "./database";
import { nanoid } from 'nanoid';

// Модель данных для колонки таблицы
class TableColumn {
  constructor(name, sqlName, type) {
    this.id = nanoid();
    this.name = name;
    this.sqlName = sqlName;
    this.type = type;
  }
}

// Модель данных для строки таблицы
class TableRow {
  constructor(values) {
    this.id = nanoid();
    this.values = values;
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
      this.initializeColumns(json);
      this.initializeRows(json);
      
      this.finishLoading();
      console.log("Данные успешно загружены и обработаны");
    } catch (error) {
      console.error("Ошибка при обработке файла:", error);
      this.finishLoading();
      throw error;
    }
  }

  // Создает таблицу в базе данных
  async createTable() {
    await createTable(this.sqlColumnNames, this.columnTypes);
    await insertRows(this.rows.map(row => row.values), this.sqlColumnNames);
  }

  // Вспомогательные методы
  initializeColumns(json) {
    if (!json.length) return;
    
    const columnNames = Object.keys(json[0]);
    const sqlNames = parseColumnNames(columnNames);
    const columnTypes = parseColumnTypes(Object.values(json[0]));
    
    this.columns = columnNames.map((name, index) => 
      new TableColumn(name, sqlNames[index], columnTypes[index], columnTypes[index])
    );
  }

  initializeRows(json) {
    this.rows = json.slice(1).map(row => 
      new TableRow(Object.values(row))
    );
  }

  // Геттеры для удобного доступа к данным
  get columnNames() {
    if (!this.rows.length || !this.columns.length) return [];
    return this.columns.map(col => col.name);
  }
  
  get sqlColumnNames() {
    if (!this.rows.length || !this.columns.length) return [];
    return this.columns.map(col => col.sqlName);
  }
  
  get columnTypes() {
    if (!this.rows.length || !this.columns.length) return [];
    return this.columns.map(col => col.type);
  }
  
  get hasData() {
    return this.rows.length > 0 && this.columns.length > 0;
  }
}

// Экспортируем singleton-экземпляр стора
export default new InitialDataState();