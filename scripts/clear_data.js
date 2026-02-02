import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'arimbi.db');

console.log('🧹 Cleaning up database data...');

try {
    const db = new Database(DB_PATH);

    // Safety check
    const prompt = process.argv.includes('--force');
    if (!prompt) {
        console.log('⚠️  This will DELETE ALL Products, Bundles, and Transactions.');
        console.log('   Admin users and Settings will be preserved.');
        console.log('   Run with "node scripts/clear_data.js --force" to confirm.');
        process.exit(0);
    }

    // Execute cleanup
    db.prepare('DELETE FROM transaction_items').run();
    db.prepare('DELETE FROM transactions').run();
    db.prepare('DELETE FROM bundle_items').run();
    db.prepare('DELETE FROM bundles').run();
    db.prepare('DELETE FROM products').run();

    // Optional: Reset sequences if you want IDs to restart (often not needed for UUIDs/Texts)
    // db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('products', ...)");

    console.log('✅ All data cleared successfully!');
    console.log('   - Products: 0');
    console.log('   - Bundles: 0');
    console.log('   - Transactions: 0');
    console.log('   - Users (Admin): Preserved');

} catch (error) {
    console.error('❌ Failed to clear data:', error.message);
}
