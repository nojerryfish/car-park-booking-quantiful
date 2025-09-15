import Database from "better-sqlite3"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

export function getDb(dbFile?: string) {
  const file =
    dbFile ?? process.env.DB_FILE ?? path.resolve(process.cwd(), "data.sqlite")
  const db = new Database(file)
  // Apply pragmas for consistency
  db.pragma("journal_mode = WAL")
  db.pragma("foreign_keys = ON")

  // Initialize schema from file
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  // Try dist/schema.sql first (when compiled), fallback to src/schema.sql (dev)
  const candidatePaths = [
    path.resolve(__dirname, "schema.sql"),
    path.resolve(__dirname, "../src/schema.sql"),
  ]
  const schemaPath = candidatePaths.find(p => fs.existsSync(p))
  if (!schemaPath) throw new Error("schema.sql not found")
  const schemaSQL = fs.readFileSync(schemaPath, "utf-8")
  db.exec(schemaSQL)

  return db
}

export type DB = ReturnType<typeof getDb>
