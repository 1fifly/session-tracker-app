const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'sessions.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    notes TEXT,
    category TEXT,
    tags TEXT,
    length TEXT,
    todos TEXT,
    timestamp TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    notifications INTEGER,
    weeklyGoal INTEGER,
    defaultCategory TEXT,
    defaultSessionEndRule TEXT
  )
`);

db.prepare('INSERT OR IGNORE INTO settings (id) VALUES (1)').run();

function saveSession(sessionData) {
  const { 
    id,
    title, 
    description, 
    notes, 
    category, 
    tags, 
    length, 
    todos,
    timestamp 
  } = sessionData || {}; 

  const toSqliteValue = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number' || typeof value === 'string' || Buffer.isBuffer(value)) return value;
    try {
      return JSON.stringify(value);
    } catch (e) {
      console.error('Failed to stringify value:', value, e);
      return null;
    }
  };

  const safeTitle = toSqliteValue(title);
  const safeDescription = toSqliteValue(description);
  const safeNotes = toSqliteValue(notes);
  const safeCategory = toSqliteValue(category);
  const safeTags = toSqliteValue(tags);
  const safeLength = toSqliteValue(length);
  const safeTodos = toSqliteValue(todos);
  const safeTimestamp = toSqliteValue(
    timestamp && typeof timestamp === 'string' && timestamp.match(/^\d{4}-\d{2}-\d{2}/)
      ? timestamp
      : new Date().toISOString().split('T')[0]
  );

  if (id) {
    const existing = db.prepare('SELECT id FROM sessions WHERE id = ?').get(id);
    if (existing) {
      const stmt = db.prepare(`
        UPDATE sessions SET 
          title = ?, 
          description = ?, 
          notes = ?, 
          category = ?, 
          tags = ?, 
          length = ?, 
          todos = ?, 
          timestamp = ?
        WHERE id = ?
      `);
      stmt.run(
        safeTitle,
        safeDescription,
        safeNotes,
        safeCategory,
        safeTags,
        safeLength,
        safeTodos,
        safeTimestamp,
        id
      );
      console.log('Updated session ID:', id);
      return id;
    }
  }

  const stmt = db.prepare(`
    INSERT INTO sessions (id, title, description, notes, category, tags, length, todos, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    id && Number.isInteger(id) && id > 0 ? id : null, 
    safeTitle,
    safeDescription,
    safeNotes,
    safeCategory,
    safeTags,
    safeLength,
    safeTodos,
    safeTimestamp
  );
  const insertedId = id && Number.isInteger(id) && id > 0 ? id : info.lastInsertRowid;
  console.log('Inserted session ID:', insertedId);
  return insertedId;
}

function loadSessions() {
  const stmt = db.prepare('SELECT * FROM sessions');
  const rows = stmt.all();
  return rows.map(row => {
    let parsedTodos = [];
    if (row.todos) {
      try {
        parsedTodos = JSON.parse(row.todos);
      } catch (e) {
        console.error('Failed to parse todos:', row.todos, e);
        parsedTodos = [];
      }
    }

    return {
      ...row,
      tags: row.tags || '',
      todos: parsedTodos
    };
  });
}

function deleteSession(id) {
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
  stmt.run(id);
  return true;
}

function deleteAllSessions() {
  const stmt = db.prepare('DELETE FROM sessions');
  stmt.run();
  return true;
}

function saveSettings(settings) {
  const stmt = db.prepare(`
    UPDATE settings SET 
      notifications = ?, 
      weeklyGoal = ?, 
      defaultCategory = ?, 
      defaultSessionEndRule = ? 
    WHERE id = 1
  `);
  stmt.run(
    settings.notifications ? 1 : 0,
    settings.weeklyGoal,
    settings.defaultCategory,
    settings.defaultSessionEndRule
  );
}

function loadSettings() {
  const stmt = db.prepare('SELECT * FROM settings WHERE id = 1');
  const row = stmt.get();
  return {
    notifications: row.notifications === 1,
    weeklyGoal: row.weeklyGoal,
    defaultCategory: row.defaultCategory,
    defaultSessionEndRule: row.defaultSessionEndRule
  };
}

module.exports = { saveSession, loadSessions, deleteSession, deleteAllSessions, saveSettings, loadSettings };