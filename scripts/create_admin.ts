
import { db } from '../src/lib/server/db/index.js';
import { getDatabase } from '../src/lib/server/db/sqlite.js';

console.log('🔄 Forcing Admin User Reset...');

try {
    const sqlite = getDatabase();

    // 1. Delete existing admin
    sqlite.prepare("DELETE FROM users WHERE username = 'admin'").run();
    console.log('🗑️  Deleted existing admin user (if any)');

    // 2. Create new admin
    // Hash for 'admin123'
    const hash = '$2b$10$vzHxOxYXrfwmVBVvxwemMUSyAZszGK2';

    sqlite.prepare(`
        INSERT INTO users (username, password_hash, role)
        VALUES (?, ?, ?)
    `).run('admin', hash, 'admin');

    console.log('✅ Admin user created successfully!');
    console.log('   Username: admin');
    console.log('   Password: admin123');

} catch (error) {
    console.error('❌ Failed to reset admin:', error);
}
