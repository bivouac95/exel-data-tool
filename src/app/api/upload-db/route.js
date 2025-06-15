import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

// Папка, где лежит database.db
const DB_PATH = path.join(
  process.cwd(),
  "src",
  "server_components",
  "database.db"
);

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await writeFile(DB_PATH, buffer);
    return NextResponse.json({ message: "File uploaded" });
  } catch (err) {
    console.error("Failed to write file:", err);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
