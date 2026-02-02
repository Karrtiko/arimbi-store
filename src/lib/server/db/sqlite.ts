import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import schema from './schema.sql?raw';

// Get database path from environment or use default
const DB_PATH = process.env.DB_PATH || join(process.cwd(), 'data', 'arimbi.db');

// Ensure data directory exists
const dataDir = dirname(DB_PATH);
if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
let db: Database.Database;

export function getDatabase(): Database.Database {
    if (!db) {
        db = new Database(DB_PATH, { verbose: console.log });
        db.pragma('journal_mode = WAL'); // Better concurrency
        db.pragma('foreign_keys = ON'); // Enable foreign keys
        initializeSchema();
    }
    return db;
}

function initializeSchema() {
    // Execute schema (split by semicolon and execute each statement)
    const statements = schema.split(';').filter(s => s.trim());

    for (const statement of statements) {
        if (statement.trim()) {
            db.exec(statement);
        }
    }

    console.log('✅ Database schema initialized');
}

// Close database connection (for cleanup)
export function closeDatabase() {
    if (db) {
        db.close();
        console.log('Database connection closed');
    }
}

// Export database instance
export { db };
