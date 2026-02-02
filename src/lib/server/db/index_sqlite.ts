// SQLite Database Layer for Arimbi Store
// Replaces JSON file-based storage with proper SQL database

import { getDatabase } from './sqlite.js';
import type Database from 'better-sqlite3';

// Type definitions
interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    created_at: string;
}

interface Country {
    id: number;
    name: string;
    slug: string;
    flag_emoji: string;
    is_active?: boolean | number;
    created_at: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    country: string;
    image_url: string;
    is_active: number;
    created_at: string;
    updated_at: string;
}

interface Bundle {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    is_active: number;
    created_at: string;
}

interface BundleItem {
    bundle_id: string;
    product_id: string;
    quantity: number;
}

interface Transaction {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    total: number;
    status: string;
    shipping_number?: string;
    notes?: string;
    timestamp: string;
    created_at: string;
}

interface TransactionItem {
    id?: number;
    transaction_id: string;
    product_id?: string;
    product_name: string;
    quantity: number;
    price: number;
}

interface Settings {
    [key: string]: any;
}

interface Page {
    slug: string;
    title: string;
    content: any;
    updated_at: string;
}

export interface User {
    id: number;
    username: string;
    password_hash: string;
    role: 'admin' | 'staff';
    created_at: string;
    last_login?: string;
}

// Get database instance
let dbInstance: Database.Database;

function getDb(): Database.Database {
    if (!dbInstance) {
        dbInstance = getDatabase();
    }
    return dbInstance;
}

// Database operations
export const db = {
    // ==================== PRODUCTS ====================

    getProducts: (filters?: {
        category?: string;
        country?: string;
        search?: string;
        is_active?: boolean;
        limit?: number;
        offset?: number;
    }) => {
        const db = getDb();
        let query = 'SELECT * FROM products WHERE 1=1';
        const params: any[] = [];

        if (filters?.category) {
            query += ' AND category = ?';
            params.push(filters.category);
        }

        if (filters?.country) {
            query += ' AND country = ?';
            params.push(filters.country);
        }

        if (filters?.search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (filters?.is_active !== undefined) {
            query += ' AND is_active = ?';
            params.push(filters.is_active ? 1 : 0);
        }

        query += ' ORDER BY created_at DESC';

        if (filters?.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
        }

        if (filters?.offset) {
            query += ' OFFSET ?';
            params.push(filters.offset);
        }

        return db.prepare(query).all(...params) as Product[];
    },

    getProductById: (id: string) => {
        const db = getDb();
        return db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined;
    },

    createProduct: (product: Omit<Product, 'created_at' | 'updated_at'>) => {
        const db = getDb();
        const stmt = db.prepare(`
            INSERT INTO products (id, name, description, price, stock, category, country, image_url, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            product.id,
            product.name,
            product.description,
            product.price,
            product.stock || 0,
            product.category,
            product.country,
            product.image_url,
            product.is_active
        );

        return db.getProductById(product.id);
    },

    updateProduct: (id: string, updates: Partial<Product>) => {
        const db = getDb();
        const fields: string[] = [];
        const values: any[] = [];

        Object.entries(updates).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'created_at') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        });

        if (fields.length === 0) return;

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
        db.prepare(query).run(...values);
    },

    deleteProduct: (id: string) => {
        const db = getDb();
        db.prepare('DELETE FROM products WHERE id = ?').run(id);
    },

    // ==================== BUNDLES ====================

    getBundles: (activeOnly = false) => {
        const db = getDb();
        let query = 'SELECT * FROM bundles';
        if (activeOnly) {
            query += ' WHERE is_active = 1';
        }
        query += ' ORDER BY created_at DESC';

        const bundles = db.prepare(query).all() as Bundle[];

        // Get items for each bundle
        return bundles.map(bundle => ({
            ...bundle,
            items: db.getBundleItems(bundle.id)
        }));
    },

    getBundleById: (id: string) => {
        const db = getDb();
        const bundle = db.prepare('SELECT * FROM bundles WHERE id = ?').get(id) as Bundle | undefined;
        if (!bundle) return undefined;

        return {
            ...bundle,
            items: db.getBundleItems(id)
        };
    },

    getBundleItems: (bundleId: string) => {
        const db = getDb();
        return db.prepare('SELECT * FROM bundle_items WHERE bundle_id = ?').all(bundleId) as BundleItem[];
    },

    createBundle: (bundle: Omit<Bundle, 'created_at'>, items: BundleItem[]) => {
        const db = getDb();

        // Start transaction
        const transaction = db.transaction(() => {
            // Insert bundle
            db.prepare(`
                INSERT INTO bundles (id, name, description, price, image_url, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                bundle.id,
                bundle.name,
                bundle.description,
                bundle.price,
                bundle.image_url,
                bundle.is_active
            );

            // Insert items
            const itemStmt = db.prepare(`
                INSERT INTO bundle_items (bundle_id, product_id, quantity)
                VALUES (?, ?, ?)
            `);

            items.forEach(item => {
                itemStmt.run(bundle.id, item.product_id, item.quantity);
            });
        });

        transaction();
        return db.getBundleById(bundle.id);
    },

    updateBundle: (id: string, updates: Partial<Bundle>, items?: BundleItem[]) => {
        const db = getDb();

        const transaction = db.transaction(() => {
            // Update bundle
            if (Object.keys(updates).length > 0) {
                const fields: string[] = [];
                const values: any[] = [];

                Object.entries(updates).forEach(([key, value]) => {
                    if (key !== 'id' && key !== 'created_at') {
                        fields.push(`${key} = ?`);
                        values.push(value);
                    }
                });

                if (fields.length > 0) {
                    values.push(id);
                    db.prepare(`UPDATE bundles SET ${fields.join(', ')} WHERE id = ?`).run(...values);
                }
            }

            // Update items if provided
            if (items) {
                db.prepare('DELETE FROM bundle_items WHERE bundle_id = ?').run(id);

                const itemStmt = db.prepare(`
                    INSERT INTO bundle_items (bundle_id, product_id, quantity)
                    VALUES (?, ?, ?)
                `);

                items.forEach(item => {
                    itemStmt.run(id, item.product_id, item.quantity);
                });
            }
        });

        transaction();
    },

    deleteBundle: (id: string) => {
        const db = getDb();
        db.prepare('DELETE FROM bundles WHERE id = ?').run(id);
    },

    // ==================== TRANSACTIONS ====================

    getTransactions: (page = 1, limit = 50, filters?: {
        status?: string;
        search?: string;
        startDate?: string;
        endDate?: string;
    }) => {
        const db = getDb();
        let query = 'SELECT * FROM transactions WHERE 1=1';
        const params: any[] = [];

        if (filters?.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters?.search) {
            query += ' AND (customer_name LIKE ? OR customer_phone LIKE ? OR id LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters?.startDate) {
            query += ' AND timestamp >= ?';
            params.push(filters.startDate);
        }

        if (filters?.endDate) {
            query += ' AND timestamp <= ?';
            params.push(filters.endDate);
        }

        query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        params.push(limit, (page - 1) * limit);

        const transactions = db.prepare(query).all(...params) as Transaction[];

        // Get items for each transaction
        return {
            transactions: transactions.map(t => ({
                ...t,
                items: db.getTransactionItems(t.id)
            })),
            total: db.prepare('SELECT COUNT(*) as count FROM transactions').get() as { count: number }
        };
    },

    getTransactionById: (id: string) => {
        const db = getDb();
        const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as Transaction | undefined;
        if (!transaction) return undefined;

        return {
            ...transaction,
            items: db.getTransactionItems(id)
        };
    },

    getTransactionItems: (transactionId: string) => {
        const db = getDb();
        return db.prepare('SELECT * FROM transaction_items WHERE transaction_id = ?').all(transactionId) as TransactionItem[];
    },

    createTransaction: (transaction: Omit<Transaction, 'created_at'>, items: TransactionItem[]) => {
        const db = getDb();

        const trans = db.transaction(() => {
            // Insert transaction
            db.prepare(`
                INSERT INTO transactions (id, customer_name, customer_phone, customer_address, total, status, shipping_number, notes, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                transaction.id,
                transaction.customer_name,
                transaction.customer_phone,
                transaction.customer_address || '',
                transaction.total,
                transaction.status || 'PENDING',
                transaction.shipping_number || null,
                transaction.notes || null,
                transaction.timestamp
            );

            // Insert items and reduce stock
            const itemStmt = db.prepare(`
                INSERT INTO transaction_items (transaction_id, product_id, product_name, quantity, price)
                VALUES (?, ?, ?, ?, ?)
            `);

            const updateStockStmt = db.prepare(`
                UPDATE products SET stock = stock - ? WHERE id = ?
            `);

            items.forEach(item => {
                itemStmt.run(
                    transaction.id,
                    item.product_id || null,
                    item.product_name,
                    item.quantity,
                    item.price
                );

                // Reduce stock if product_id exists
                if (item.product_id) {
                    updateStockStmt.run(item.quantity, item.product_id);
                }
            });
        });

        trans();
        return db.getTransactionById(transaction.id);
    },

    updateTransaction: (id: string, updates: Partial<Transaction>) => {
        const db = getDb();
        const fields: string[] = [];
        const values: any[] = [];

        Object.entries(updates).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'created_at' && key !== 'timestamp') {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        });

        if (fields.length === 0) return;

        values.push(id);
        db.prepare(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    },

    deleteTransaction: (id: string) => {
        const db = getDb();
        db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    },

    getTransactionStats: (dailyDateStr?: string, monthlyDateStr?: string) => {
        const db = getDb();
        const now = new Date();

        // Parse dates
        const dailyDate = dailyDateStr ? new Date(dailyDateStr) : now;
        const dailyDateKey = dailyDate.toISOString().split('T')[0];

        let viewMonth = now.getMonth();
        let viewYear = now.getFullYear();

        if (monthlyDateStr && typeof monthlyDateStr === 'string') {
            const parts = monthlyDateStr.split('-');
            if (parts.length === 2) {
                viewYear = parseInt(parts[0]);
                viewMonth = parseInt(parts[1]) - 1;
            }
        }

        const monthStart = new Date(viewYear, viewMonth, 1).toISOString();
        const monthEnd = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59).toISOString();

        // Get revenue stats
        const revenueStatuses = ['PAID', 'SHIPPED', 'DONE'];
        const statusPlaceholders = revenueStatuses.map(() => '?').join(',');

        const dailyRevenue = db.prepare(`
            SELECT COALESCE(SUM(total), 0) as revenue
            FROM transactions
            WHERE status IN (${statusPlaceholders})
            AND DATE(timestamp) = ?
        `).get(...revenueStatuses, dailyDateKey) as { revenue: number };

        const monthRevenue = db.prepare(`
            SELECT COALESCE(SUM(total), 0) as revenue
            FROM transactions
            WHERE status IN (${statusPlaceholders})
            AND timestamp >= ? AND timestamp <= ?
        `).get(...revenueStatuses, monthStart, monthEnd) as { revenue: number };

        const totalRevenue = db.prepare(`
            SELECT COALESCE(SUM(total), 0) as revenue
            FROM transactions
            WHERE status IN (${statusPlaceholders})
        `).get(...revenueStatuses) as { revenue: number };

        // Get status counts
        const pendingCount = db.prepare(`SELECT COUNT(*) as count FROM transactions WHERE status = 'PENDING'`).get() as { count: number };
        const needProcessCount = db.prepare(`SELECT COUNT(*) as count FROM transactions WHERE status = 'PAID'`).get() as { count: number };

        // Get orders for today
        const orders = db.prepare(`
            SELECT COUNT(*) as count FROM transactions WHERE DATE(timestamp) = ?
        `).get(dailyDateKey) as { count: number };

        // Get active products count
        const products = db.prepare(`SELECT COUNT(*) as count FROM products WHERE is_active = 1`).get() as { count: number };

        return {
            totalRevenue: totalRevenue.revenue,
            dailyRevenue: dailyRevenue.revenue,
            monthRevenue: monthRevenue.revenue,
            pendingCount: pendingCount.count,
            needProcessCount: needProcessCount.count,
            statusCounts: {
                PENDING: pendingCount.count,
                PAID: needProcessCount.count,
                SHIPPED: 0,
                DONE: 0,
                CANCELLED: 0
            },
            viewDailyDate: dailyDateStr || now.toISOString().split('T')[0],
            viewMonth: viewMonth,
            viewYear: viewYear,
            viewMonthStr: monthlyDateStr || `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`,
            products: products.count,
            orders: orders.count
        };
    },

    // ==================== SETTINGS ====================

    getSettings: () => {
        const db = getDb();
        const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];

        const settings: Settings = {};
        rows.forEach(row => {
            try {
                settings[row.key] = JSON.parse(row.value);
            } catch {
                settings[row.key] = row.value;
            }
        });

        return settings;
    },

    getSetting: (key: string) => {
        const db = getDb();
        const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
        if (!row) return undefined;

        try {
            return JSON.parse(row.value);
        } catch {
            return row.value;
        }
    },

    setSetting: (key: string, value: any) => {
        const db = getDb();
        const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);

        db.prepare(`
            INSERT INTO settings (key, value, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
        `).run(key, jsonValue, jsonValue);
    },

    // ==================== PAGES (CMS) ====================

    getPages: () => {
        const db = getDb();
        const pages = db.prepare('SELECT * FROM pages').all() as Page[];
        return pages.map(page => ({
            ...page,
            content: typeof page.content === 'string' ? JSON.parse(page.content) : page.content
        }));
    },

    getPage: (slug: string) => {
        const db = getDb();
        const page = db.prepare('SELECT * FROM pages WHERE slug = ?').get(slug) as Page | undefined;
        if (!page) return undefined;

        return {
            ...page,
            content: typeof page.content === 'string' ? JSON.parse(page.content) : page.content
        };
    },

    updatePage: (slug: string, title: string, content: any) => {
        const db = getDb();
        const jsonContent = typeof content === 'string' ? content : JSON.stringify(content);

        db.prepare(`
            INSERT INTO pages (slug, title, content, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(slug) DO UPDATE SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
        `).run(slug, title, jsonContent, title, jsonContent);
    },

    // ==================== CATEGORIES & COUNTRIES ====================
    // These are kept simple for now - can be moved to database later if needed

    getCategories: () => {
        // Hardcoded for now - can be moved to DB if needed
        return [
            { id: 1, name: 'Snacks', slug: 'snacks', description: 'Delicious snacks from around the world', created_at: new Date().toISOString() },
            { id: 2, name: 'Skincare', slug: 'skincare', description: 'Quality skincare products', created_at: new Date().toISOString() },
            { id: 3, name: 'Beverages', slug: 'beverages', description: 'Refreshing drinks', created_at: new Date().toISOString() }
        ];
    },

    getCountries: () => {
        return [
            { id: 1, name: 'Japan', slug: 'japan', flag_emoji: '🇯🇵', is_active: 1, created_at: new Date().toISOString() },
            { id: 2, name: 'Korea', slug: 'korea', flag_emoji: '🇰🇷', is_active: 1, created_at: new Date().toISOString() },
            { id: 3, name: 'Thailand', slug: 'thailand', flag_emoji: '🇹🇭', is_active: 1, created_at: new Date().toISOString() },
            { id: 4, name: 'China', slug: 'china', flag_emoji: '🇨🇳', is_active: 1, created_at: new Date().toISOString() }
        ];
    },

    getActiveCountries: () => {
        return db.getCountries().filter(c => c.is_active);
    },

    // ==================== USERS ====================

    getUsers: () => {
        // User management can be added later if needed
        return [];
    },

    getUserByUsername: (username: string) => {
        // Hardcoded admin for now
        if (username === 'admin') {
            return {
                id: 1,
                username: 'admin',
                password_hash: '$2a$10$rGHQzN8zN8zN8zN8zN8zN.', // bcrypt hash of 'admin123'
                role: 'admin' as const,
                created_at: new Date().toISOString()
            };
        }
        return undefined;
    }
};
