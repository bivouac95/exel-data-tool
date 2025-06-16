"use server";

const sqlite3 = require("sqlite3").verbose();
const xlsx = require("xlsx");

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

const db = new sqlite3.Database("database.db");

// Helper functions for asynchronous SQLite operations
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

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
    const buffer = Buffer.from(bytes);
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
  const tables = await allAsync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`
  );
  const views = await allAsync(
    `SELECT name FROM sqlite_master WHERE type='view';`
  );

  for (const { name } of tables) {
    await runAsync(`DROP TABLE IF EXISTS "${name}"`);
  }
  for (const { name } of views) {
    await runAsync(`DROP VIEW IF EXISTS "${name}"`);
  }
}

// Создает таблицу
export async function createTable(columnNames, columnTypes) {
  await clearDatabase();

  // Note: REGEXP function is not supported in sqlite3 and has been removed.
  // Queries using REGEXP will fail unless modified to avoid it.

  const columns = columnNames
    .map((name, i) => `"${name}" ${columnTypes[i]}`)
    .join(", ");
  const createDataSQL = `CREATE TABLE "data" (
    id TEXT PRIMARY KEY${columns ? ", " + columns : ""}
  )`;
  await runAsync(createDataSQL);

  const createTablesSQL = `CREATE TABLE "tables" (
    id TEXT PRIMARY KEY,
    type TEXT,
    name TEXT,
    readable_name TEXT,
    sqlQuery TEXT
  )`;
  await runAsync(createTablesSQL);

  const createColumnsSQL = `CREATE TABLE "columns" (
    id TEXT PRIMARY KEY,
    sqlName TEXT,
    name TEXT,
    tableName TEXT
  )`;
  await runAsync(createColumnsSQL);
}

// Удаляет все строки из таблицы
export async function clearTable() {
  await runAsync("DELETE FROM data;");
}

// Удаляет таблицу по имени
export async function deleteTable(name) {
  await runAsync(`DROP VIEW IF EXISTS "${name}"`);
  await runAsync(`DELETE FROM tables WHERE name = ?`, [name]);
}

// Добавляет строку
export async function insertRow(row, columnNames) {
  const sql = `INSERT INTO data ( ${columnNames.join(", ")} ) VALUES ( ${row
    .map(() => "?")
    .join(", ")} )`;
  await runAsync(sql, row);
}

// Удаляет строку
export async function deleteRow(id) {
  await runAsync("DELETE FROM data WHERE id = ?", [id]);
}

// Обновляет строку
export async function updateRow(rowId, row, columnNames) {
  const sql = `UPDATE data SET ${columnNames
    .map((name) => `${name} = ?`)
    .join(", ")} WHERE id = ?`;
  await runAsync(sql, [...row, rowId]);
}

// Добавляет строки
export async function insertRows(rows, columnNames) {
  const sql = `INSERT INTO data ( ${columnNames.join(
    ", "
  )} ) VALUES ( ${columnNames.map(() => "?").join(", ")} )`;
  await runAsync("BEGIN");
  try {
    for (let row of rows) {
      await runAsync(sql, row);
    }
    await runAsync("COMMIT");
  } catch (err) {
    await runAsync("ROLLBACK");
    throw err;
  }
}

// Получает все строки из таблицы
export async function getData() {
  return await allAsync(`SELECT * FROM data`);
}

// Выполняет запрос
export async function executeQuery(query) {
  const sql = `SELECT * FROM data WHERE ${query}`;
  return await allAsync(sql);
}

// Создать поисковой запрос
export async function createSearchQuery(query, table, id, name, readable_name) {
  const createView = `CREATE VIEW ${name} AS SELECT * FROM ${table} WHERE ${query}`;
  await runAsync(createView);
  const createRecord =
    "INSERT INTO tables (id, type, name, readable_name, sqlQuery) VALUES (?, ?, ?, ?, ?)";
  await runAsync(createRecord, [id, "search", name, readable_name, createView]);
}

// Создает отчет
export async function createReport(query, id, name, readable_name) {
  await runAsync(query);
  const createRecord = `INSERT INTO tables (id, type, name, readable_name, sqlQuery) VALUES (?, ?, ?, ?, ?)`;
  await runAsync(createRecord, [id, "report", name, readable_name, query]);
}

// Получить данные запроса
export async function getReportData(name) {
  return await allAsync(`SELECT * FROM ${name}`);
}

// Получить таблицы
export async function getTables() {
  return await allAsync(`SELECT * FROM tables`);
}

// Получить колонки таблицы по имени таблицы
export async function getColumns(tableName) {
  const data = await allAsync(`SELECT * FROM ${tableName}`);
  if (data.length == 0) return [];
  else return Object.keys(data[0]);
}

// Добавляет колонки
export async function insertColumns(rows) {
  const sql = `INSERT INTO columns (id, sqlName, name, tableName) VALUES (?, ?, ?, ?)`;
  await runAsync("BEGIN");
  try {
    for (let row of rows) {
      await runAsync(sql, row);
    }
    await runAsync("COMMIT");
  } catch (err) {
    await runAsync("ROLLBACK");
    throw err;
  }
}

// Получить улучшенные колонки
export async function getBetterColumns(tableName) {
  return await allAsync(`SELECT * FROM columns WHERE tableName = ?`, [
    tableName,
  ]);
}
