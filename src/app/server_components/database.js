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

const db = new Database("database.db");

function transliterate(text) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    if (translitDict[text.toLowerCase()[i]]) {
      result += translitDict[text.toLowerCase()[i]];
    } else {
      if (text[i] >= '0' && text[i] <= '9') {
        result += text[i];
      }
    }
  }
  return result;
}

export async function parseColumnNames(cirilicColumnNames) {
  return Promise.resolve()
    .then(() => {
      let result = [];
      for (let i = 0; i < cirilicColumnNames.length; i++) {
        result.push(transliterate(cirilicColumnNames[i]));
      }
      return result;
    });
}

export async function parseColumnTypes(columnValues) {
  let columnTypes = [];
  for (let value of columnValues) {
    switch (typeof value) {
      case "string":
        columnTypes.push("TEXT");
        break;
      case "number":
        columnTypes.push("INTEGER");
        break;
    }
  }
  return columnTypes;
}

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

export async function createTable(columnNames, columnTypes) {
  db.prepare('DROP TABLE IF EXISTS data;').run();
  const sql = `CREATE TABLE data (id INTEGER PRIMARY KEY AUTOINCREMENT, ${columnNames
    .map((name, index) => `${name} ${columnTypes[index]}`)
    .join(", ")})`;
  db.prepare(sql).run();
}

export async function clearTable() {
  db.prepare('DELETE FROM data;').run();
}

export async function insertRow(row, columnNames) {
  const sql = `INSERT INTO data ( ${columnNames.join(", ")} ) VALUES ( ${row
    .map(() => "?")
    .join(", ")} )`;
  db.prepare(sql).run(row);
}

export async function insertRows(rows, columnNames) {
  const sql = `INSERT INTO data ( ${columnNames.join(", ")} ) VALUES ( ${columnNames.map((_name) => "?").join(", ")} )`
  const insert = db.prepare(sql);
  const insertMany = db.transaction((rows) => {
    for (let row of rows) {
      insert.run(row);
    }
  });
  insertMany(rows);
}

export async function getData() {
  const sql = `SELECT * FROM data`;
  return db.prepare(sql).all();
}

export async function executeQuery(query) {
  const sql = `SELECT * FROM data WHERE ${query}`;
  return db.prepare(sql).all();
}