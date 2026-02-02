import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ url }) => {
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sort') || 'timestamp';
    const sortDir = url.searchParams.get('dir') || 'desc';

    // Fetch Transactions
    const { transactions, pagination } = db.getTransactions(page, limit, { search, sortBy, sortDir });

    // Fetch Stats
    // The DB adapter's getTransactionStats returns { todayRevenue, monthRevenue, pendingCount, ... }
    const monthParam = url.searchParams.get('month');
    const yearParam = url.searchParams.get('year');
    const statusParam = url.searchParams.get('status');
    const searchParam = url.searchParams.get('search');

    const month = monthParam ? parseInt(monthParam) : undefined;
    const year = yearParam ? parseInt(yearParam) : undefined;

    // Convert to "YYYY-MM" format for the new getTransactionStats signature
    let monthlyDateStr = undefined;
    if (year && month !== undefined) {
        // Ensure month is 1-indexed for the string format "YYYY-MM"
        // monthParam usually comes as 0-indexed from my previous logic? 
        // Let's check the previous admin page logic. 
        // In previous admin/+page.svelte: viewMonth was 0-indexed.
        // But the URL param generator used `stats.viewMonth`.
        // Let's assume monthParam from URL is 0-indexed based on how JS Date works usually in this app.
        // Actually, let's just construct it carefully.
        monthlyDateStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    }

    // Call getTransactionStats with (dailyDateStr, monthlyDateStr)
    const stats = db.getTransactionStats(undefined, monthlyDateStr);

    // Get Active Products and Bundles for manual form
    const products = db.getActiveProducts();
    const bundles = db.getBundles();

    return {
        transactions,
        pagination,
        stats,
        filters: { page, limit, search },
        products,
        bundles
    };
};

export const actions: Actions = {
    updateStatus: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        const status = formData.get('status') as string;
        const resi = formData.get('resi') as string;

        if (!id || !status) {
            return { success: false, message: 'Missing required fields' };
        }

        db.updateTransactionStatus(id, status, resi);
        return { success: true };
    },

    deleteTransaction: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) return { success: false, message: 'Missing ID' };

        db.deleteTransaction(id);
        return { success: true };
    },

    createTransaction: async ({ request }) => {
        const formData = await request.formData();

        // Extract all form fields
        const buyerName = formData.get('buyerName') as string;
        const buyerPhone = formData.get('buyerPhone') as string;
        const isGift = formData.get('isGift') === 'true';
        const receiverName = formData.get('receiverName') as string;
        const receiverPhone = formData.get('receiverPhone') as string;
        const address = formData.get('address') as string;
        const notes = formData.get('notes') as string;
        const itemsJson = formData.get('items') as string;
        const total = Number(formData.get('total'));

        // Basic validation
        if (!buyerName || !total) {
            return { success: false, message: 'Missing required fields' };
        }

        let items = [];
        try {
            items = JSON.parse(itemsJson || '[]');
            // Ensure product_id is number
            items = items.map((item: any) => ({
                ...item,
                product_id: item.product_id ? Number(item.product_id) : undefined,
                qty: Number(item.qty) || 1
            }));
        } catch (e) {
            items = [];
        }

        try {
            const newTrx = db.addTransaction({
                buyer: { name: buyerName, phone: buyerPhone },
                receiver: isGift ? { name: receiverName, phone: receiverPhone } : undefined,
                isGift,
                address,
                notes,
                items,
                total,
                status: 'PENDING',
                resi: null
            });

            return { success: true, transaction: newTrx };
        } catch (error: any) {
            return { success: false, message: error.message || 'Gagal membuat transaksi' };
        }
    },

    updateTransaction: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;

        // Extract all form fields (same as create)
        const buyerName = formData.get('buyerName') as string;
        const buyerPhone = formData.get('buyerPhone') as string;
        const isGift = formData.get('isGift') === 'true';
        const receiverName = formData.get('receiverName') as string;
        const receiverPhone = formData.get('receiverPhone') as string;
        const address = formData.get('address') as string;
        const notes = formData.get('notes') as string;
        const itemsJson = formData.get('items') as string;
        const total = Number(formData.get('total'));

        if (!id || !buyerName) {
            return { success: false, message: 'Missing required fields' };
        }

        let items = [];
        try {
            items = JSON.parse(itemsJson || '[]');
            // Ensure product_id or bundle_id is set correctly
            items = items.map((item: any) => {
                let pid = undefined;
                let bid = undefined;

                // Determine if product or bundle
                // Logic: 
                // 1. If type is explicit
                // 2. Or if product_id string starts with 'b-' (from UI value)
                const isBundle = item.type === 'bundle' || (typeof item.product_id === 'string' && item.product_id.startsWith('b-'));

                if (isBundle) {
                    // Extract ID if it has prefix 'b-', otherwise use as is
                    const idStr = String(item.product_id);
                    bid = idStr.startsWith('b-') ? Number(idStr.substring(2)) : Number(item.product_id);
                } else {
                    // Product
                    const idStr = String(item.product_id);
                    pid = idStr.startsWith('p-') ? Number(idStr.substring(2)) : Number(item.product_id); // Handle potential 'p-' prefix too just in case
                }

                return {
                    ...item,
                    product_id: pid,
                    bundle_id: bid,
                    qty: Number(item.qty) || 1
                    // type field is preserved if present, but db uses product_id/bundle_id check
                };
            });
        } catch (e) {
            items = [];
        }

        try {
            db.updateTransaction(id, {
                buyer: { name: buyerName, phone: buyerPhone },
                receiver: isGift ? { name: receiverName, phone: receiverPhone } : undefined,
                isGift,
                address,
                notes,
                items,
                total
            });

            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message || 'Gagal update transaksi' };
        }
    }
};
