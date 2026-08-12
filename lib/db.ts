import Database from "better-sqlite3";
import path from "node:path";

declare global {
  var _db: Database.Database | undefined;
}

function init() {
  const db = new Database(path.join(process.cwd(), "crm.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','teacher','student')),
      google_refresh_token TEXT
    );
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      zoom_link TEXT NOT NULL,
      google_event_id TEXT
    );
  `);
  return db;
}

export const db = globalThis._db ?? (globalThis._db = init());

export type Role = "admin" | "teacher" | "student";

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  google_refresh_token: string | null;
};

export type ClassRow = {
  id: number;
  teacher_id: number;
  title: string;
  starts_at: string;
  ends_at: string;
  zoom_link: string;
  google_event_id: string | null;
};
