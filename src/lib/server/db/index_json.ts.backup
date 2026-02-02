// In-memory database for development
// For production, you can switch to SQLite or PostgreSQL
// For production, you can switch to SQLite or PostgreSQL

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

interface Variant {
    id: string;
    name: string;
    price?: number; // Optional if price overrides base price
    stock?: number;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    category_id: number;
    country_id: number;
    image_url: string;
    images?: string[]; // Added multi-image support
    attributes: any;
    variants?: Variant[];
    is_featured: number;
    is_active: number;
    stock?: number;
    created_at: string;
    updated_at: string;
}

interface BundleItem {
    product_id: number;
    quantity: number;
}

interface Bundle {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    images?: string[]; // Multiple images support
    price: number;
    stock: number; // Independent stock
    items: BundleItem[];
    is_active: boolean;
    created_at: string;
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

// In-memory data store
import { jsonDb } from '../data/index';
// @ts-ignore
import bcrypt from 'bcryptjs';

// Helper to access data
const getData = () => jsonDb.get();

// Database operations
export const db = {
    // Categories
    getCategories: () => getData().categories,
    getCategoryBySlug: (slug: string) => getData().categories.find((c: Category) => c.slug === slug),

    // Countries
    // Countries
    getCountries: () => getData().countries,
    getActiveCountries: () => {
        const data = getData();
        // Seed Pages if missing (Lazy Migration)
        if (!data.pages) {
            data.pages = [
                {
                    slug: 'home',
                    title: 'Home',
                    content: {
                        hero_title: 'Jajanan yang Kamu Kangenin, <br><span class="text-primary">Skincare yang Kamu Butuhin.</span>',
                        hero_subtitle: 'Pengen snack oleh-oleh hits dari luar negeri nggak perlu nunggu jastip. Plus, ada koleksi skincare pilihan buat harian kamu. Semua ready, tinggal angkut!',
                        origin_title: 'Jalan-Jalan Virtual Lewat Jajanan',
                        origin_subtitle: 'Pilih negara favoritmu dan temukan snack autentik langsung dari asalnya.',
                        best_seller_title: '🔥 Produk Terlaris',
                        best_seller_subtitle: 'Favorit pelanggan kami bulan ini',
                        low_stock_title: '⚡ Buruan! Stok Tinggal Sedikit',
                        low_stock_subtitle: 'Jangan sampai kehabisan produk favoritmu'
                    },
                    updated_at: new Date().toISOString()
                },
                {
                    slug: 'about',
                    title: 'About Us',
                    content: {
                        hero_tag: '👋 Kenalan Yuk!',
                        hero_title: 'Bawa Pulang <span class="highlight">Jajanan Dunia</span><br>ke Rumahmu!',
                        hero_text: 'Hai! Selamat datang di Arimbi Store. Tempatnya kamu cari cemilan unik dari luar negeri dan rahasia kulit sehat yang sudah kami pilihkan khusus buat kamu.',
                        hero_image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=1000&auto=format&fit=crop',
                        story_title: 'Gimana Awalnya? 🤔',
                        story_text_1: 'Berawal dari hobi jajan dan sering dititipin oleh-oleh sama temen, kami sadar kalau cari <strong class="text-accent">snack luar negeri</strong> yang asli itu gampang-gampang susah. Akhirnya, Arimbi Store hadir supaya kamu nggak perlu terbang jauh-jauh cuma buat ngerasain Pocky Jepang atau Keripik Korea.',
                        story_text_2: 'Oh iya, nggak cuma buat perut, kami juga peduli sama penampilan kamu. Makanya, kami juga sediain koleksi <strong class="text-primary">skincare pilihan</strong> yang emang sudah terbukti bagus dan aman dipakai.',
                        stats_1_num: '500+',
                        stats_1_label: 'Happy Customer',
                        stats_2_num: '100%',
                        stats_2_label: 'Original Items',
                        promise_title: '✋ Janji Kami',
                        promise_1_title: 'Pasti Asli',
                        promise_1_desc: 'Nggak perlu khawatir, semua barang di sini 100% original. No KW-KW club!',
                        promise_2_title: 'Snack Luar Negeri Asli',
                        promise_2_desc: 'Semua jajanan kami bawa langsung dari negara asalnya (Jepang, Korea, Thailand, dll).',
                        promise_3_title: 'Skincare Pilihan',
                        promise_3_desc: 'Skincare yang kami jual sudah kami cek dulu kualitasnya, jadi kamu tinggal pakai aja.',
                        promise_4_title: 'Packing Anti-Remuk',
                        promise_4_desc: 'Kami tahu rasanya sedih kalau snack sampai dalam keadaan hancur. Perlindungan ekstra aman!'
                    },
                    updated_at: new Date().toISOString()
                }
            ];
            jsonDb.write();
        }
        return (data.countries || []).filter((c: any) => c.is_active === 1 || c.is_active === true);
    },
    getCountryBySlug: (slug: string) => getData().countries.find((c: Country) => c.slug === slug),

    // Products
    getProducts: (filters?: {
        category?: string;
        country?: string;
        search?: string;
        featured?: boolean;
        includeInactive?: boolean;
    }) => {
        const data = getData();
        let filtered = data.products;

        if (!filters?.includeInactive) {
            filtered = filtered.filter((p: Product) => p.is_active === 1);
        }

        if (filters?.category) {
            const category = data.categories.find((c: Category) => c.slug === filters.category);
            if (category) {
                filtered = filtered.filter((p: Product) => p.category_id === category.id);
            }
        }

        if (filters?.country) {
            const country = data.countries.find((c: Country) => c.slug === filters.country);
            if (country) {
                filtered = filtered.filter((p: Product) => p.country_id === country.id);
            }
        }

        if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(
                (p: Product) =>
                    p.name.toLowerCase().includes(searchLower) ||
                    p.description.toLowerCase().includes(searchLower)
            );
        }

        if (filters?.featured) {
            filtered = filtered.filter((p: Product) => p.is_featured === 1);
        }

        return filtered;
    },

    getProductBySlug: (slug: string) => getData().products.find((p: Product) => p.slug === slug && p.is_active === 1),

    getProductsWithDetails: (filters?: any) => {
        const filtered = db.getProducts({ ...filters, includeInactive: true });
        const data = getData();
        return filtered.map((p: Product) => ({
            ...p,
            category_name: data.categories.find((c: Category) => c.id === p.category_id)?.name,
            category_slug: data.categories.find((c: Category) => c.id === p.category_id)?.slug,
            country_name: data.countries.find((c: Country) => c.id === p.country_id)?.name,
            country_flag: data.countries.find((c: Country) => c.id === p.country_id)?.flag_emoji,
        }));
    },

    getProductWithDetails: (slug: string) => {
        const product = db.getProductBySlug(slug);
        if (!product) return null;

        const data = getData();
        return {
            ...product,
            category_name: data.categories.find((c: Category) => c.id === product.category_id)?.name,
            category_slug: data.categories.find((c: Category) => c.id === product.category_id)?.slug,
            country_name: data.countries.find((c: Country) => c.id === product.country_id)?.name,
            country_flag: data.countries.find((c: Country) => c.id === product.country_id)?.flag_emoji,
        };
    },

    getCategoriesWithCount: () => {
        const data = getData();
        return data.categories.map((c: Category) => ({
            ...c,
            product_count: data.products.filter((p: Product) => p.category_id === c.id && p.is_active === 1).length,
        }));
    },

    // Admin / CMS Operations (New)
    save: () => jsonDb.write(),
    refresh: () => jsonDb.refresh(),

    // CRUD Helpers (Simple implementation for now)
    addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
        const data = getData();
        const newId = Math.max(...data.products.map((p: Product) => p.id), 0) + 1;
        const newProduct = {
            ...product,
            id: newId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        data.products.push(newProduct);
        jsonDb.write();
        return newProduct;
    },

    updateProduct: (id: number, updates: Partial<Product>) => {
        const data = getData();
        const index = data.products.findIndex((p: Product) => p.id === id);
        if (index !== -1) {
            data.products[index] = { ...data.products[index], ...updates, updated_at: new Date().toISOString() };
            jsonDb.write();
            return data.products[index];
        }
        return null;
    },

    deleteProduct: (id: number) => {
        const data = getData();
        const index = data.products.findIndex((p: Product) => p.id === id);
        if (index !== -1) {
            data.products.splice(index, 1);
            jsonDb.write();
            return true;
        }
        return false;
    },

    updateProductStock: (id: number, quantityChange: number) => {
        const data = getData();
        const product = data.products.find((p: any) => p.id === id);
        if (product) {
            product.stock = (product.stock || 0) + quantityChange;
            jsonDb.write();
            return true;
        }
        return false;
    },

    // Transaction Operations
    getTransactions: (page: number = 1, perPage?: number, filters?: { status?: string; startDate?: Date; endDate?: Date; search?: string, sortBy?: string, sortDir?: string }) => {
        const data = getData();
        const settings = data.settings || {};
        const itemsPerPage = perPage ?? 10;

        let transactions = [...(data.transactions || [])];

        // Filter by Date Range
        if (filters?.startDate || filters?.endDate) {
            transactions = transactions.filter((t: any) => {
                const tDate = new Date(t.timestamp || t.created_at);
                if (filters?.startDate && tDate < filters.startDate) return false;
                if (filters?.endDate) {
                    const end = new Date(filters.endDate);
                    end.setHours(23, 59, 59, 999);
                    if (tDate > end) return false;
                }
                return true;
            });
        }

        // Filter by Status
        if (filters?.status) {
            transactions = transactions.filter((t: any) => t.status === filters!.status);
        }

        // Filter by Search (ID, Customer Name, Phone)
        if (filters?.search) {
            const lowerSearch = filters.search.toLowerCase();
            transactions = transactions.filter((t: any) =>
                (t.id && t.id.toLowerCase().includes(lowerSearch)) ||
                (t.buyer?.name && t.buyer.name.toLowerCase().includes(lowerSearch)) ||
                (t.buyer?.phone && t.buyer.phone.includes(filters!.search))
            );
        }

        // Sort by Newest (Default) or Custom
        const sortBy = filters?.sortBy || 'timestamp';
        const sortDir = filters?.sortDir || 'desc';

        transactions.sort((a: any, b: any) => {
            let valA, valB;
            if (sortBy === 'total') {
                valA = a.total || 0;
                valB = b.total || 0;
            } else if (sortBy === 'buyer') {
                valA = a.buyer?.name || '';
                valB = b.buyer?.name || '';
            } else {
                valA = new Date(a.timestamp || a.created_at).getTime();
                valB = new Date(b.timestamp || b.created_at).getTime();
            }

            if (sortDir === 'asc') return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });

        // Pagination
        const totalItems = transactions.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const validPage = Math.max(1, Math.min(page, totalPages || 1));
        const startIndex = (validPage - 1) * itemsPerPage;

        return {
            transactions: transactions.slice(startIndex, startIndex + itemsPerPage),
            pagination: {
                currentPage: validPage,
                totalPages,
                totalItems,
                perPage: itemsPerPage,
                hasNextPage: validPage < totalPages,
                hasPrevPage: validPage > 1
            }
        };
    },

    addTransaction: (transaction: any) => {
        const data = getData();

        // Stock Validation & Reduction
        if (transaction.items && Array.isArray(transaction.items)) {
            for (const item of transaction.items) {
                // Handle Product Stock
                if (item.product_id) {
                    const product = data.products.find((p: any) => p.id === item.product_id);
                    if (!product) {
                        throw new Error(`Product dengan ID ${item.product_id} tidak ditemukan`);
                    }

                    const currentStock = product.stock || 0;
                    if (currentStock < item.qty) {
                        throw new Error(`Stok ${product.name} tidak cukup. Tersedia: ${currentStock}, Diminta: ${item.qty}`);
                    }

                    // Reduce stock
                    product.stock = currentStock - item.qty;
                    product.updated_at = new Date().toISOString();

                    // Cache Product Details
                    if (!item.product_name) {
                        item.product_name = product.name;
                        item.price = item.price || product.price;
                    }
                }

                // Handle Bundle Stock
                else if (item.bundle_id) {
                    const bundle = data.bundles ? data.bundles.find((b: any) => b.id === item.bundle_id) : null;
                    if (!bundle) {
                        throw new Error(`Bundle dengan ID ${item.bundle_id} tidak ditemukan`);
                    }

                    const currentStock = bundle.stock || 0;
                    if (currentStock < item.qty) {
                        throw new Error(`Stok Paket ${bundle.name} tidak cukup. Tersedia: ${currentStock}, Diminta: ${item.qty}`);
                    }

                    // Reduce stock
                    bundle.stock = currentStock - item.qty;
                    bundle.updated_at = new Date().toISOString();

                    // Cache Bundle Details
                    if (!item.product_name) {
                        item.product_name = `[Paket] ${bundle.name}`;
                        item.price = item.price || bundle.price;
                    }
                }
            }
        }

        // Generate Invoice ID if not present
        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const newId = transaction.id || `INV-${dateStr}-${randomSuffix}`;

        const newTransaction = {
            ...transaction,
            id: newId,
            status: transaction.status || 'PENDING',
            timestamp: transaction.timestamp || new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        if (!data.transactions) data.transactions = [];
        data.transactions.push(newTransaction);
        jsonDb.write();
        return newTransaction;
    },

    updateTransactionStatus: (id: string, status: string, resi?: string) => {
        const data = getData();
        const index = data.transactions.findIndex((t: any) => t.id === id);

        if (index !== -1) {
            data.transactions[index].status = status;
            if (resi) data.transactions[index].resi = resi;
            data.transactions[index].updated_at = new Date().toISOString();
            jsonDb.write();
            return data.transactions[index];
        }
        return null;
    },

    updateTransaction: (id: string, updates: any) => {
        const data = getData();
        const index = data.transactions.findIndex((t: any) => t.id === id);

        if (index !== -1) {
            // Update fields
            const currentTrx = data.transactions[index];

            // Handle Items & Stock Logic if items changed (simplified: restore old stock, deduct new)
            // For now, assuming simple update without complex stock recalc for MVP unless requested
            // Ideally: if items changed, revert old stock, then apply new stock. 
            // BUT for this task, let's just update the record fields.

            data.transactions[index] = {
                ...currentTrx,
                ...updates,
                updated_at: new Date().toISOString()
            };
            jsonDb.write();
            return data.transactions[index];
        }
        throw new Error('Transaksi tidak ditemukan');
    },

    deleteTransaction: (id: string) => {
        const data = getData();
        const index = data.transactions.findIndex((t: any) => t.id === id);

        if (index !== -1) {
            data.transactions.splice(index, 1);
            jsonDb.write();
            return true;
        }
        return false;
    },

    getTransactionStats: (dailyDateStr?: string, monthlyDateStr?: string) => {
        const data = getData();
        const now = new Date();
        const transactions = data.transactions || [];

        // Default to today if not provided
        const dailyDate = dailyDateStr ? new Date(dailyDateStr) : now;
        const dailyDateKey = dailyDate.toDateString();

        // Default to current month if not provided
        // monthlyDateStr format expected: "YYYY-MM"
        let viewMonth = now.getMonth();
        let viewYear = now.getFullYear();

        if (monthlyDateStr && typeof monthlyDateStr === 'string') {
            const parts = monthlyDateStr.split('-');
            if (parts.length === 2) {
                viewYear = parseInt(parts[0]);
                viewMonth = parseInt(parts[1]) - 1; // JS months are 0-indexed
            }
        }

        // Filter transactions
        // Status matching 'PAID', 'SHIPPED', 'DONE' count as revenue
        const revenueStatuses = ['PAID', 'SHIPPED', 'DONE'];

        let dailyRevenue = 0;
        let monthRevenue = 0;

        let pendingCount = 0;
        let needProcessCount = 0;
        let totalRevenue = 0;

        const statusCounts: Record<string, number> = {
            PENDING: 0,
            PAID: 0,
            SHIPPED: 0,
            DONE: 0,
            CANCELLED: 0
        };

        transactions.forEach((t: any) => {
            const tDate = new Date(t.timestamp || t.created_at);
            const status = t.status || 'PENDING';

            // Global Status Counts
            if (statusCounts[status] !== undefined) {
                statusCounts[status]++;
            }

            if (status === 'PENDING') pendingCount++;
            if (status === 'PAID') needProcessCount++;

            // Revenue checks
            if (revenueStatuses.includes(status)) {
                totalRevenue += (t.total || 0);

                // Daily matches
                if (tDate.toDateString() === dailyDateKey) {
                    dailyRevenue += (t.total || 0);
                }

                // Monthly matches
                if (tDate.getMonth() === viewMonth && tDate.getFullYear() === viewYear) {
                    monthRevenue += (t.total || 0);
                }
            }
        });

        return {
            totalRevenue,
            dailyRevenue,
            monthRevenue,
            pendingCount,
            needProcessCount,
            statusCounts,

            // View Metadata
            viewDailyDate: dailyDateStr || now.toISOString().split('T')[0],
            viewMonth: viewMonth,
            viewYear: viewYear,
            viewMonthStr: monthlyDateStr || `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`,

            // Extra stats
            products: (data.products || []).filter((p: any) => p.is_active).length,
            orders: transactions.filter((t: any) => {
                const date = new Date(t.timestamp || t.created_at);
                return date.toDateString() === dailyDateKey;
            }).length
        };
    },

    // Product Operations
    getProductById: (id: number) => {
        const data = getData();
        return (data.products || []).find((p: any) => p.id === id);
    },

    getActiveProducts: () => {
        const data = getData();
        return (data.products || []).filter((p: any) => p.is_active === 1 || p.is_active === true);
    },


    // Settings
    getSettings: () => getData().settings || {},
    updateSettings: (newSettings: any) => {
        const data = getData();
        data.settings = { ...data.settings, ...newSettings };
        jsonDb.write();
        return data.settings;
    },

    // Active & Filtered Data Helpers

    getLowStockProducts: (threshold?: number) => {
        const settings = getData().settings || {};
        const stockThreshold = threshold ?? settings.low_stock_threshold ?? 10;
        return getData().products.filter((p: any) =>
            (p.is_active !== 0 && p.is_active !== false) &&
            p.stock > 0 &&
            p.stock <= stockThreshold
        );
    },

    getBestSellerProducts: (limit?: number, days: number = 30) => {
        const data = getData();
        const settings = data.settings || {};
        const resultLimit = limit ?? settings.best_sellers_limit ?? 10;

        // Calculate date threshold
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);

        // Count orders per product from transactions
        const productSales: { [key: number]: number } = {};
        data.transactions.forEach((t: any) => {
            const transactionDate = new Date(t.created_at);
            if (transactionDate >= dateThreshold && t.items) {
                t.items.forEach((item: any) => {
                    productSales[item.product_id] = (productSales[item.product_id] || 0) + item.quantity;
                });
            }
        });

        // Sort products by sales count
        const sortedProducts = data.products
            .filter((p: any) => p.is_active !== 0 && p.is_active !== false)
            .map((p: any) => ({
                ...p,
                sales_count: productSales[p.id] || 0
            }))
            .filter((p: any) => p.sales_count > 0)
            .sort((a: any, b: any) => b.sales_count - a.sales_count)
            .slice(0, resultLimit);

        return sortedProducts;
    },

    // Bundles Operations
    getBundles: (activeOnly: boolean = true) => {
        const data = getData();
        const bundles = data.bundles || [];
        if (activeOnly) {
            return bundles.filter((b: Bundle) => b.is_active);
        }
        return bundles;
    },

    getBundleBySlug: (slug: string) => {
        const data = getData();
        return (data.bundles || []).find((b: Bundle) => b.slug === slug);
    },

    createBundle: (bundle: Omit<Bundle, 'id' | 'created_at' | 'updated_at'>) => {
        const data = getData();
        if (!data.bundles) data.bundles = [];

        const newId = Math.max(...data.bundles.map((b: Bundle) => b.id || 0), 0) + 1;
        const newBundle = {
            ...bundle,
            id: newId,
            stock: bundle.stock ?? 0,
            images: bundle.images ?? [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        data.bundles.push(newBundle);
        jsonDb.write();
        return newBundle;
    },

    updateBundle: (id: number, updates: Partial<Bundle>) => {
        const data = getData();
        if (!data.bundles) return null;

        const index = data.bundles.findIndex((b: Bundle) => b.id === id);
        if (index !== -1) {
            data.bundles[index] = { ...data.bundles[index], ...updates, updated_at: new Date().toISOString() };
            jsonDb.write();
            return data.bundles[index];
        }
        return null;
    },

    deleteBundle: (id: number) => {
        const data = getData();
        if (!data.bundles) return false;

        const index = data.bundles.findIndex((b: Bundle) => b.id === id);
        if (index !== -1) {
            data.bundles.splice(index, 1);
            jsonDb.write();
            return true;
        }
        return false;
    },

    getBundleWithDetails: (slug: string) => {
        const bundle = db.getBundleBySlug(slug);
        if (!bundle) return null;

        const data = getData();
        // Enrich items with product details
        const enrichedItems = bundle.items.map((item: BundleItem) => {
            const product = data.products.find((p: Product) => p.id === item.product_id);
            return {
                ...item,
                product_name: product?.name || 'Unknown Product',
                product_price: product?.price || 0,
                product_image: product?.image_url
            };
        });

        // Calculate original price (sum of parts)
        const original_price = enrichedItems.reduce((sum: number, item: any) => sum + (item.product_price * item.quantity), 0);

        return {
            ...bundle,
            items: enrichedItems,
            original_price
        };
    },

    getProductsPaginated: (page: number = 1, perPage?: number, filters?: { search?: string; category_id?: number }) => {
        const data = getData();
        const settings = data.settings || {};
        const itemsPerPage = perPage ?? settings.products_per_page_catalog ?? 15;

        // Start with active products
        let products = data.products.filter((p: any) => p.is_active !== 0 && p.is_active !== false);

        // Apply filters
        if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            products = products.filter((p: any) =>
                p.name.toLowerCase().includes(searchLower) ||
                (p.description && p.description.toLowerCase().includes(searchLower))
            );
        }

        if (filters?.category_id) {
            products = products.filter((p: any) => p.category_id === filters.category_id);
        }

        // Calculate pagination
        const totalProducts = products.length;
        const totalPages = Math.ceil(totalProducts / itemsPerPage);
        const validPage = Math.max(1, Math.min(page, totalPages || 1));
        const startIndex = (validPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return {
            products: products.slice(startIndex, endIndex),
            pagination: {
                currentPage: validPage,
                totalPages,
                totalProducts,
                perPage: itemsPerPage,
                hasNextPage: validPage < totalPages,
                hasPrevPage: validPage > 1
            }
        };
    },

    // User Management
    getUsers: () => {
        const data = getData();
        return data.users || [];
    },

    getUserByUsername: (username: string) => {
        const data = getData();
        return (data.users || []).find((u: User) => u.username === username);
    },

    getUserById: (id: number) => {
        const data = getData();
        return (data.users || []).find((u: User) => u.id === id);
    },

    createUser: async (user: Omit<User, 'id' | 'created_at'>) => {
        const data = getData();
        if (!data.users) data.users = [];

        // Check duplicates
        if (data.users.find((u: User) => u.username === user.username)) {
            throw new Error('Username already exists');
        }

        const newId = Math.max(...data.users.map((u: User) => u.id), 0) + 1;
        const newUser = {
            ...user,
            id: newId,
            password_hash: await bcrypt.hash(user.password_hash, 10), // Assuming input is raw password
            created_at: new Date().toISOString()
        };
        data.users.push(newUser);
        jsonDb.write();
        return newUser;
    },

    updateUser: async (id: number, updates: Partial<User> & { password?: string }) => {
        const data = getData();
        if (!data.users) return null;

        const index = data.users.findIndex((u: User) => u.id === id);
        if (index !== -1) {
            const updatedUser = { ...data.users[index], ...updates };
            if (updates.password) {
                updatedUser.password_hash = await bcrypt.hash(updates.password, 10);
                delete (updates as any).password;
            }
            data.users[index] = updatedUser;
            jsonDb.write();
            return updatedUser;
        }
        return null;
    },

    deleteUser: (id: number) => {
        const data = getData();
        if (!data.users) return false;

        const index = data.users.findIndex((u: User) => u.id === id);
        if (index !== -1) {
            data.users.splice(index, 1);
            jsonDb.write();
            return true;
        }
        return false;
    },

    // CMS Pages
    getPages: () => getData().pages || [],
    getPage: (slug: string) => (getData().pages || []).find((p: any) => p.slug === slug),
    savePage: (slug: string, content: any) => {
        const data = getData();
        if (!data.pages) data.pages = [];

        let page = data.pages.find((p: any) => p.slug === slug);
        if (page) {
            page.content = { ...page.content, ...content };
            page.updated_at = new Date().toISOString();
        } else {
            data.pages.push({
                slug,
                title: slug.charAt(0).toUpperCase() + slug.slice(1),
                content,
                updated_at: new Date().toISOString()
            });
        }
        jsonDb.write();
        return page || data.pages.find((p: any) => p.slug === slug);
    }
};

export function initDatabase() {
    console.log('✅ JSON Database adapter initialized');

    // Seed default admin if no users exist
    const data = getData();
    if (!data.users || data.users.length === 0) {
        console.log('Creating default admin user...');
        if (!data.users) data.users = [];

        // Sync hash generation
        const hash = bcrypt.hashSync('admin', 10);
        data.users.push({
            id: 1,
            username: 'admin',
            password_hash: hash,
            role: 'admin',
            created_at: new Date().toISOString()
        });
        jsonDb.write();
        console.log('✅ Default admin created: admin / admin');
    }
}

export function seedDatabase() {
    // No-op for now as we load from file
    console.log('✅ Database already seeded from file');
}
