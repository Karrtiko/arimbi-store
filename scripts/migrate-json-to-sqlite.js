#!/usr/bin/env node

/**
 * Migration script: JSON to SQLite
 * Imports existing JSON data into SQLite database
 */

import Database from 'better-sqlite3';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Paths
const JSON_DB_PATH = join(projectRoot, 'src', 'lib', 'server', 'data', 'db.json');
const SQLITE_DB_PATH = join(projectRoot, 'data', 'arimbi.db');
const SCHEMA_PATH = join(projectRoot, 'src', 'lib', 'server', 'db', 'schema.sql');

console.log('🔄 Starting migration from JSON to SQLite...\n');

// Ensure data directory exists
const dataDir = dirname(SQLITE_DB_PATH);
if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
    console.log('✅ Created data directory');
}

// Check if JSON file exists
if (!existsSync(JSON_DB_PATH)) {
    console.error('❌ JSON database file not found:', JSON_DB_PATH);
    process.exit(1);
}

// Read JSON data
console.log('📖 Reading JSON database...');
const jsonData = JSON.parse(readFileSync(JSON_DB_PATH, 'utf-8'));
console.log(`   Found ${jsonData.products?.length || 0} products`);
console.log(`   Found ${jsonData.bundles?.length || 0} bundles`);
console.log(`   Found ${jsonData.transactions?.length || 0} transactions\n`);

// Initialize SQLite database
console.log('🗄️  Initializing SQLite database...');
const db = new Database(SQLITE_DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Load and execute schema
console.log('📝 Creating database schema...');
const schema = readFileSync(SCHEMA_PATH, 'utf-8');
const statements = schema.split(';').filter(s => s.trim());

for (const statement of statements) {
    if (statement.trim()) {
        db.exec(statement);
    }
}
console.log('✅ Schema created\n');

// Migration functions
function migrateProducts() {
    if (!jsonData.products || jsonData.products.length === 0) {
        console.log('⏭️  No products to migrate');
        return;
    }

    console.log('📦 Migrating products...');
    const stmt = db.prepare(`
        INSERT INTO products (id, name, description, price, stock, category, country, image_url, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((products) => {
        let count = 0;
        for (const product of products) {
            try {
                stmt.run(
                    product.id || `prod_${Date.now()}_${count}`,
                    product.name || 'Unnamed Product',
                    product.description || '',
                    product.price || 0,
                    product.stock || 0,
                    product.category || 'uncategorized',
                    product.country || 'unknown',
                    product.image_url || '',
                    product.is_active !== false ? 1 : 0,
                    product.created_at || new Date().toISOString(),
                    product.updated_at || new Date().toISOString()
                );
                count++;
            } catch (error) {
                console.error(`   ⚠️  Failed to migrate product ${product.id}:`, error.message);
            }
        }
        return count;
    });

    const count = transaction(jsonData.products);
    console.log(`✅ Migrated ${count} products\n`);
}

function migrateBundles() {
    if (!jsonData.bundles || jsonData.bundles.length === 0) {
        console.log('⏭️  No bundles to migrate');
        return;
    }

    console.log('🎁 Migrating bundles...');
    const bundleStmt = db.prepare(`
        INSERT INTO bundles (id, name, description, price, image_url, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const itemStmt = db.prepare(`
        INSERT INTO bundle_items (bundle_id, product_id, quantity)
        VALUES (?, ?, ?)
    `);

    const transaction = db.transaction((bundles) => {
        let count = 0;
        for (const bundle of bundles) {
            try {
                bundleStmt.run(
                    bundle.id || `bundle_${Date.now()}_${count}`,
                    bundle.name || 'Unnamed Bundle',
                    bundle.description || '',
                    bundle.price || 0,
                    bundle.image_url || '',
                    bundle.is_active !== false ? 1 : 0,
                    bundle.created_at || new Date().toISOString()
                );

                // Migrate bundle items
                if (bundle.items && Array.isArray(bundle.items)) {
                    for (const item of bundle.items) {
                        itemStmt.run(
                            bundle.id,
                            item.product_id,
                            item.quantity || 1
                        );
                    }
                }

                count++;
            } catch (error) {
                console.error(`   ⚠️  Failed to migrate bundle ${bundle.id}:`, error.message);
            }
        }
        return count;
    });

    const count = transaction(jsonData.bundles);
    console.log(`✅ Migrated ${count} bundles\n`);
}

function migrateTransactions() {
    if (!jsonData.transactions || jsonData.transactions.length === 0) {
        console.log('⏭️  No transactions to migrate');
        return;
    }

    console.log('💳 Migrating transactions...');
    const transStmt = db.prepare(`
        INSERT INTO transactions (id, customer_name, customer_phone, customer_address, total, status, shipping_number, notes, timestamp, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const itemStmt = db.prepare(`
        INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, price)
        VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((transactions) => {
        let count = 0;
        for (const trans of transactions) {
            try {
                transStmt.run(
                    trans.id || `trans_${Date.now()}_${count}`,
                    trans.customer_name || 'Unknown',
                    trans.customer_phone || '',
                    trans.customer_address || '',
                    trans.total || 0,
                    trans.status || 'PENDING',
                    trans.shipping_number || null,
                    trans.notes || null,
                    trans.timestamp || new Date().toISOString(),
                    trans.created_at || new Date().toISOString()
                );

                // Migrate transaction items
                if (trans.items && Array.isArray(trans.items)) {
                    for (const item of trans.items) {
                        itemStmt.run(
                            trans.id,
                            item.product_id || null,
                            item.product_name || item.name || 'Unknown',
                            item.quantity || 1,
                            item.price || 0
                        );
                    }
                }

                count++;
            } catch (error) {
                console.error(`   ⚠️  Failed to migrate transaction ${trans.id}:`, error.message);
            }
        }
        return count;
    });

    const count = transaction(jsonData.transactions);
    console.log(`✅ Migrated ${count} transactions\n`);
}

function migrateSettings() {
    if (!jsonData.settings || Object.keys(jsonData.settings).length === 0) {
        console.log('⏭️  No settings to migrate');
        return;
    }

    console.log('⚙️  Migrating settings...');
    const stmt = db.prepare(`
        INSERT INTO settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    `);

    const transaction = db.transaction((settings) => {
        let count = 0;
        for (const [key, value] of Object.entries(settings)) {
            try {
                const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
                stmt.run(key, jsonValue);
                count++;
            } catch (error) {
                console.error(`   ⚠️  Failed to migrate setting ${key}:`, error.message);
            }
        }
        return count;
    });

    const count = transaction(jsonData.settings);
    console.log(`✅ Migrated ${count} settings\n`);
}

function migratePages() {
    if (!jsonData.pages || jsonData.pages.length === 0) {
        console.log('⏭️  No pages to migrate');
        return;
    }

    console.log('📄 Migrating pages...');
    const stmt = db.prepare(`
        INSERT INTO pages (slug, title, content, updated_at)
        VALUES (?, ?, ?, ?)
    `);

    const transaction = db.transaction((pages) => {
        let count = 0;
        for (const page of pages) {
            try {
                const jsonContent = typeof page.content === 'string' ? page.content : JSON.stringify(page.content);
                stmt.run(
                    page.slug,
                    page.title || page.slug,
                    jsonContent,
                    page.updated_at || new Date().toISOString()
                );
                count++;
            } catch (error) {
                console.error(`   ⚠️  Failed to migrate page ${page.slug}:`, error.message);
            }
        }
        return count;
    });

    const count = transaction(jsonData.pages);
    console.log(`✅ Migrated ${count} pages\n`);
}

// Run migrations
try {
    migrateProducts();
    migrateBundles();
    migrateTransactions();
    migrateSettings();
    migratePages();

    console.log('🎉 Migration completed successfully!');
    console.log(`\n📊 Database location: ${SQLITE_DB_PATH}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Backup your JSON file: cp src/lib/server/data/db.json src/lib/server/data/db.json.backup');
    console.log('   2. Test the application: npm run dev');
    console.log('   3. Verify all features work correctly');
    console.log('   4. Deploy with Docker: docker-compose up -d\n');

} catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
} finally {
    db.close();
}
