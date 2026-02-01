import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve('src/lib/server/data/db.json');

// Types based on our schema
export interface DatabaseSchema {
    categories: any[];
    countries: any[];
    products: any[];
    transactions: any[];
    bundles?: any[];
    users?: any[];
    cms: {
        hero: {
            title: string;
            subtitle: string;
            button_text: string;
        }
    };
    settings?: {
        watermark_path?: string;
        watermark_opacity?: number;
        watermark_scale?: number;
        watermark_position?: string;
        low_stock_threshold?: number;
        products_per_page_catalog?: number;
        products_per_category_home?: number;
        best_sellers_limit?: number;
    };
}

class JsonDbAdapter {
    private data: DatabaseSchema;

    constructor() {
        // Initial load
        this.data = this.read();
    }

    private read(): DatabaseSchema {
        try {
            if (!fs.existsSync(DB_PATH)) {
                console.error('Database file not found at:', DB_PATH);
                return {
                    categories: [],
                    countries: [],
                    products: [],
                    transactions: [],
                    cms: { hero: { title: '', subtitle: '', button_text: '' } },
                    settings: { watermark_path: '', watermark_opacity: 0.5, watermark_scale: 0.2, watermark_position: 'bottom-right' }
                };
            }
            const raw = fs.readFileSync(DB_PATH, 'utf-8');
            return JSON.parse(raw);
        } catch (e) {
            console.error('Failed to read database:', e);
            throw e;
        }
    }

    public write(): void {
        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 4), 'utf-8');
        } catch (e) {
            console.error('Failed to write database:', e);
        }
    }

    // Getters for live reference (In-memory cache)
    public get() {
        return this.data;
    }

    // Force reload from disk (useful if edited manually or by another process)
    public refresh() {
        this.data = this.read();
    }
}

// Singleton instance
export const jsonDb = new JsonDbAdapter();
