import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('ibadahmate.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    totalReward INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS daily_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    date TEXT NOT NULL,
    fardPrayers TEXT,
    naflPrayers TEXT,
    tilawat TEXT,
    mamulat TEXT,
    goodDeeds TEXT,
    dailyTotal INTEGER DEFAULT 0,
    UNIQUE(userId, date),
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

export default db;
