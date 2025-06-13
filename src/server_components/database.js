"use server";

import Database from "better-sqlite3";
import * as xlsx from "xlsx";

const translitDict = {
  " ": "_",
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const latin = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const db = new Database("database.db");

// Функция транслитерации
function transliterate(text) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const lowerChar = text.toLowerCase()[i];
    if (translitDict[lowerChar]) {
      result += translitDict[lowerChar];
    } else if (latin.includes(text[i])) {
      result += text[i];
    } else if (text[i] >= "0" && text[i] <= "9") {
      result += text[i];
    }
  }
  return result;
}

export async function asyncTransliterate(text) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const lowerChar = text.toLowerCase()[i];
    if (translitDict[lowerChar]) {
      result += translitDict[lowerChar];
    } else if (latin.includes(text[i])) {
      result += text[i];
    } else if (text[i] >= "0" && text[i] <= "9") {
      result += text[i];
    }
  }
  return result;
}

// Парсит названия столбцов
export async function parseColumnNames(cirilicColumnNames) {
  return Promise.resolve().then(() => {
    let result = [];
    for (let i = 0; i < cirilicColumnNames.length; i++) {
      result.push(transliterate(cirilicColumnNames[i]));
    }
    return result;
  });
}

// Парсит типы столбцов
export async function parseColumnTypes(columnValues) {
  let columnTypes = [];
  for (let value of columnValues) {
    switch (typeof value) {
      case "string":
        columnTypes.push("TEXT");
        break;
      case "number":
        columnTypes.push("REAL");
        break;
    }
  }
  return columnTypes;
}

// Парсит файл XLSX
export async function parseDocument(document) {
  if (
    document.type ==
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    const bytes = await document.arrayBuffer();
    const buffer = new Buffer.from(bytes);
    const wb = xlsx.read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(ws);

    let result = [];
    for (let row of data) {
      result.push({});
      for (let key of Object.keys(row)) {
        result[result.length - 1][key] = row[key];
      }
    }
    return result;
  }
}

// Полностью очищает базу данных
export async function clearDatabase() {
  // Очистить все таблицы и удалить все представления (view)
  const tables = db
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`
    )
    .all();
  const views = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='view';`)
    .all();

  for (const { name } of tables) {
    db.prepare(`DROP TABLE IF EXISTS "${name}"`).run();
  }
  for (const { name } of views) {
    db.prepare(`DROP VIEW IF EXISTS "${name}"`).run();
  }
}

// Создает таблицу
export async function createTable(columnNames, columnTypes) {
  // Очистить дб
  await clearDatabase();

  // Добавляем поддержку REGEXP
  db.function("REGEXP", (pattern, value) => {
    try {
      if (typeof value !== "string") return 0; // SQLite может передать number
      const regex = new RegExp(pattern);
      return regex.test(value) ? 1 : 0;
    } catch (err) {
      return 0; // Ошибочный regex — считаем, что нет совпадения
    }
  });

  const columns = columnNames
    .map((name, i) => `"${name}" ${columnTypes[i]}`)
    .join(", ");
  const createDataSQL = `CREATE TABLE "data" (
    id TEXT PRIMARY KEY${columns ? ", " + columns : ""}
  )`;
  db.prepare(createDataSQL).run();

  const createColumnsSQL = `CREATE TABLE "columns" (
    id TEXT PRIMARY KEY,
    sqlName TEXT,
    name TEXT,
    tableName TEXT
  )`;
  db.prepare(createColumnsSQL).run();

  const createTablesSQL = `CREATE TABLE "tables" (
    id TEXT PRIMARY KEY,
    type TEXT,
    name TEXT,
    readable_name TEXT,
    sqlQuery TEXT
  )`;
  db.prepare(createTablesSQL).run();
  
  const createColumnsSQL = `CREATE TABLE "columns" (
    id TEXT PRIMARY KEY,
    sqlName TEXT,
    name TEXT,
    tableName TEXT,
  )`;
  db.prepare(createColumnsSQL).run();
}

// Удаляет все строки из таблицы
export async function clearTable() {
  db.prepare("DELETE FROM data;").run();
}

// Удаляет таблицу по имени
export async function deleteTable(name) {
  db.prepare(`DROP VIEW IF EXISTS "${name}"`).run();
  db.prepare(`DELETE FROM tables WHERE name = ?`).run(name);
}

// Добавляет строку
export async function insertRow(row, columnNames) {
  const sql = `INSERT INTO data ( ${columnNames.join(", ")} ) VALUES ( ${row
    .map(() => "?")
    .join(", ")} )`;
  db.prepare(sql).run(row);
}

// Удаляет строку
export async function deleteRow(id) {
  db.prepare("DELETE FROM data WHERE id = ?").run(id);
}

// Обновляет строку
export async function updateRow(rowId, row, columnNames) {
  const sql = `UPDATE data SET ${columnNames
    .map((name, index) => `${name} = ?`)
    .join(", ")} WHERE id = ?`;
  db.prepare(sql).run(row, rowId);
}
// Добавляет строки
export async function insertRows(rows, columnNames) {
  const sql = `INSERT INTO data ( ${columnNames.join(
    ", "
  )} ) VALUES ( ${columnNames.map((_name) => "?").join(", ")} )`;
  const insert = db.prepare(sql);
  const insertMany = db.transaction((rows) => {
    for (let row of rows) {
      insert.run(row);
    }
  });
  insertMany(rows);
}

// Получает все строки из таблицы
export async function getData() {
  const sql = `SELECT * FROM data`;
  return db.prepare(sql).all();
}

// Выполняет запрос
export async function executeQuery(query) {
  const sql = `SELECT * FROM data WHERE ${query}`;
  return db.prepare(sql).all();
}

// Создать поисковой запрос
export async function createSearchQuery(query, table, id, name, readable_name) {
  const createView = `CREATE VIEW ${name} AS SELECT * FROM ${table} WHERE ${query}`;
  db.prepare(createView).run();
  const createRecord =
    "INSERT INTO tables (id, type, name, readable_name, sqlQuery) VALUES (?, ?, ?, ?, ?)";
  db.prepare(createRecord).run(id, "search", name, readable_name, createView);
}

// Создает отчет
export async function createReport(query, id, name, readable_name) {
  db.prepare(query).run();
  const createRecord = `INSERT INTO tables (id, type, name, readable_name, sqlQuery) VALUES (?, ?, ?, ?, ?)`;
  db.prepare(createRecord).run(id, "report", name, readable_name, query);
}

// Получить данные запроса
export async function getReportData(name) {
  const sql = `SELECT * FROM ${name}`;
  return db.prepare(sql).all();
}

// Получить таблицы
export async function getTables() {
  const sql = `SELECT * FROM tables`;
  return db.prepare(sql).all();
}

// Получить колонки таблицы по имени таблицы
export async function getColumns(tableName) {
  const sql = `SELECT * FROM ${tableName}`;
  const data = db.prepare(sql).all();
  if (data.length == 0) return [];
  else return Object.keys(data[0]);

  // const sql = `SELECT * FROM columns WHERE tableName = ?`;
  // db.prepare(sql).all(tableName);
}

<<<<<<< HEAD
export async function insertColumns(rows) {
  const sql = `INSERT INTO columns (id, sqlName, name, tableName) VALUES (?, ?, ?, ?)`;
  const insert = db.prepare(sql);
  const insertMany = db.transaction((rows) => {
    for (let row of rows) {
      insert.run(...row);
    }
  });
  insertMany(rows);
}

export async function getBetterColumns(tableName) {
  const sql = `SELECT * FROM columns WHERE tableName= '${tableName}'`;
  return db.prepare(sql).all();
}
=======
export async function createColumn(id, tableName, name, sqlName) {
  const createColumnSQL = `INSERT INTO columns (id, tableName, name, sqlName) VALUES (?, ?, ?, ?)`;
  db.prepare(createColumnSQL).run(id, tableName, name, sqlName);
}
>>>>>>> 0ddb385826dca610ca3844009ea27fa8d4703940
