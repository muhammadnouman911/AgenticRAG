import Database from 'better-sqlite3';
import path from 'path';

let dbInstance: Database.Database | null = null;

export function getDb() {
  if (!dbInstance) {
    try {
      const dbDir = process.env.NODE_ENV === 'production' ? '/app/data' : process.cwd();
      const dbPath = path.join(dbDir, 'database.db');
      dbInstance = new Database(dbPath);
      
      // Initialize schema...
      dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          file_type TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'processing',
          chunk_count INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS chunks (
          id TEXT PRIMARY KEY,
          document_id TEXT NOT NULL,
          content TEXT NOT NULL,
          embedding BLOB,
          metadata_json TEXT,
          FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS chat_sessions (
          id TEXT PRIMARY KEY,
          title TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          sources_json TEXT,
          confidence REAL,
          trace_json TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );

        CREATE TABLE IF NOT EXISTS entities (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          metadata_json TEXT
        );

        CREATE TABLE IF NOT EXISTS relationships (
          id TEXT PRIMARY KEY,
          source_id TEXT NOT NULL,
          target_id TEXT NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          FOREIGN KEY(source_id) REFERENCES entities(id),
          FOREIGN KEY(target_id) REFERENCES entities(id)
        );
      `);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
  return dbInstance;
}

export const db = new Proxy({} as Database.Database, {
  get(target, prop) {
    const instance = getDb();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export default db;
