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

/**
 * Класс, представляющий колонку таблицы.
 * property {string} id - Уникальный идентификатор колонки
 * property {string} name - Человекочитаемое название колонки
 * property {string} sqlName - Название колонки для SQL-запросов
 * property {string} type - Тип данных колонки
 */
class TableColumn {
  constructor(name, sqlName, type) {
    this.id = nanoid();
    this.name = name;
    this.sqlName = sqlName;
    this.type = type;
    makeAutoObservable(this);
  }
}

/**
 * Класс, представляющий строку таблицы.
 * property {string} id - Уникальный идентификатор строки
 * property {Array<{id: string, value: any}>} values - Значения ячеек строки
 * property {boolean} editing - Флаг, указывающий редактируется ли строка
 */
class TableRow {
  constructor(values, editing = false) {
    this.id = nanoid();
    this.values = values.map((v) => ({ id: nanoid(), value: v }));
    this.editing = editing;
    makeAutoObservable(this);
  }

  /**
   * Изменяет значение в ячейке строки
   * @param {string} id - Идентификатор ячейки
   * @param {any} value - Новое значение
   */
  changeValue(id, value) {
    const index = this.values.findIndex((v) => v.id === id);
    if (index !== -1) {
      this.values[index] = { id, value };
    }
  }

  /**
   * Устанавливает режим редактирования строки
   * @param {boolean} state - Новое состояние редактирования
   */
  setEdit(state) {
    this.editing = state;
  }
}

/**
 * Главный стор для работы с табличными данными.
 * Обеспечивает:
 * - Загрузку и парсинг JSON-данных
 * - Управление колонками и строками таблицы
 * - Синхронизацию с SQLite базой данных
 * - Редактирование данных
 *
 * property {Array} jsonData - Исходные JSON-данные
 * property {Map<string, TableRow>} rows - Строки таблицы
 * property {Array<string>} rowOrder - Порядок строк
 * property {Array<TableColumn>} columns - Колонки таблицы
 * property {boolean} isLoaded - Флаг загрузки данных
 * property {boolean} isLoading - Флаг процесса загрузки
 * property {boolean} beingEdited - Флаг редактирования таблицы
 */
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

  /**
   * Начинает процесс загрузки данных
   */
  startLoading() {
    this.isLoaded = false;
    this.isLoading = true;
  }

  /**
   * Завершает процесс загрузки данных
   */
  finishLoading() {
    this.isLoading = false;
    this.isLoaded = true;
  }

  /**
   * Обрабатывает загруженный документ
   * @param {File} file - Файл с данными для загрузки
   * @throws {Error} Если произошла ошибка при обработке файла
   */
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
      console.log("Данные успешно загружены и обработаны");
    } catch (error) {
      console.error("Ошибка при обработке файла:", error);
      this.finishLoading();
      throw error;
    }
  }

  /**
   * Добавляет новую пустую строку в режиме редактирования
   */
  addNewRow() {
    const newRow = new TableRow(
      this.columns.map(() => ""),
      true
    );
    this.rows.set(newRow.id, newRow);
    this.rowOrder = [newRow.id, ...this.rowOrder];
    this.beingEdited = true;
  }

  /**
   * Удаляет строку из таблицы
   * @param {string} rowId - Идентификатор строки для удаления
   */
  deleteRow(rowId) {
    this.rows.delete(rowId);
    this.rowOrder = this.rowOrder.filter((id) => id !== rowId);
    this.updateTableSQL();
  }

  /**
   * Завершает редактирование строк
   * @param {boolean} [cancel=false] - Если true, отменяет изменения
   */
  stopEdit(cancel = false) {
    if (cancel) {
      // Удаляем строки, оставшиеся в режиме редактирования
      const keep = [];
      for (const id of this.rowOrder) {
        const r = this.rows.get(id);
        if (r.editing) {
          this.rows.delete(id);
        } else {
          keep.push(id);
        }
      }
      this.rowOrder = keep;
    } else {
      const editingId = this.rowOrder.find((id) => this.rows.get(id).editing);
      if (editingId) {
        const row = this.rows.get(editingId);
        insertRow(
          row.values.map((v) => v.value),
          this.columns.map((c) => c.sqlName)
        );
        row.setEdit(false);
      }
    }
    this.beingEdited = false;
  }

  /**
   * Создает таблицу в SQLite на основе текущих данных
   */
  async createTableSQL() {
    await createTable(this.sqlColumnNames, this.columnTypes);
    await insertRows(this.rowValues, this.sqlColumnNames);
  }

  /**
   * Обновляет таблицу в SQLite
   */
  async updateTableSQL() {
    await clearTable();
    insertRows(this.rowValues, this.sqlColumnNames);
  }

  /**
   * Обновляет конкретную строку в SQLite
   * @param {string} rowId - Идентификатор строки для обновления
   */
  async updateRowSQL(rowId) {
    const row = this.rows.get(rowId);
    if (row && !row.editing) {
      await clearTable();
      insertRow(
        row.values.map((v) => v.value),
        this.sqlColumnNames
      );
      console.log("Row updated");
    }
  }

  /**
   * Возвращает SQL-имена колонок
   * @returns {Array<string>}
   */
  get sqlColumnNames() {
    return this.columns.map((col) => col.sqlName);
  }

  /**
   * Возвращает типы колонок
   * @returns {Array<string>}
   */
  get columnTypes() {
    return this.columns.map((col) => col.type);
  }

  /**
   * Возвращает значения всех строк
   * @returns {Array<Array<any>>}
   */
  get rowValues() {
    return this.rowOrder.map((id) => {
      const row = this.rows.get(id);
      return row.values.map((v) => v.value);
    });
  }

  /**
   * Инициализирует колонки на основе JSON-данных
   * @param {Array<Object>} json - Данные для анализа
   */
  async initializeColumns(json) {
    if (!json.length) return;

    const columnNames = Object.keys(json[0]);
    const sqlNames = await parseColumnNames(columnNames);
    const columnTypes = await parseColumnTypes(Object.values(json[0]));

    this.columns = columnNames.map(
      (name, i) => new TableColumn(name, sqlNames[i], columnTypes[i])
    );
  }

  /**
   * Инициализирует строки на основе JSON-данных
   * @param {Array<Object>} json - Данные для анализа
   */
  initializeRows(json) {
    this.rows.clear();
    this.rowOrder = json.map((row) => {
      const tr = new TableRow(Object.values(row));
      this.rows.set(tr.id, tr);
      return tr.id;
    });
  }
}

// Экспорт синглтона состояния
export default new InitialDataState();
