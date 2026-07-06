const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'care.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS carers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, email TEXT UNIQUE, password_hash TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, address TEXT, phone TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    carer_id INTEGER, client_id INTEGER,
    scheduled_start TEXT, scheduled_end TEXT,
    actual_start TEXT, actual_end TEXT,
    start_lat REAL, start_lng REAL,
    end_lat REAL, end_lng REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER, rating INTEGER, comment TEXT,
    submitted_at TEXT
  )`);
});

module.exports = db;
