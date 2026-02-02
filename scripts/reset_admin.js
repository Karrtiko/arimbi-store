import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Path to database file relative to this script
const DB_PATH = join(__dirname, '..', 'data', 'arimbi.db');

console.log('🔄 Connecting to database:', DB_PATH);

try {
    const db = new Database(DB_PATH);

    // Check if users table exists (safeguard)
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    if (!tableExists) {
        console.error('❌ Table "users" does not exist yet!');
        console.error('   Please run "docker compose up -d --build" first to let the app initialize the schema.');
        process.exit(1);
    }

    // 1. Delete existing admin
    console.log('🗑️  Removing old admin user...');
    db.prepare("DELETE FROM users WHERE username = 'admin'").run();

    // 2. Create new admin
    // Hash for 'admin123' (Full valid hash)
    const hash = '$2b$10$jZDpXcnGykP9Yz/IlkHL9eT9Tv9umeEK/X8rgrCw5DaKl3vkNmzrm';

    db.prepare(`
        INSERT INTO users (username, password_hash, role)
        VALUES (?, ?, ?)
    `).run('admin', hash, 'admin');

    console.log('✅ Admin user created successfully!');
    console.log('   Username: admin');
    console.log('   Password: admin123');

} catch (error) {
    console.error('❌ Failed to reset admin:', error.message);
}
