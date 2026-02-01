import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
    // 1. Get Stats (Today & Month)
    const stats = db.getTransactionStats();

    // 2. Get Today's Transactions
    const today = new Date().toDateString();
    const allTransactions = db.getTransactions(1, 10); // Get first 10
    const transactions = allTransactions.transactions.filter((t: any) => {
        return new Date(t.timestamp).toDateString() === today;
    });

    // 3. Get Active Products for manual form
    const products = db.getActiveProducts();

    return {
        stats,
        transactions,
        products
    };
};

export const actions: Actions = {
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
        const total = Number(formData.get('total'));
        const itemsJson = formData.get('items') as string;

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

        // Determine final receiver (same as checkout logic)
        const finalReceiverName = isGift ? receiverName : buyerName;
        const finalReceiverPhone = isGift ? receiverPhone : buyerPhone;

        if (!buyerName || !total) {
            return { success: false, message: 'Missing required fields' };
        }

        try {
            db.addTransaction({
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

            return { success: true };
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
            items = items.map((item: any) => ({
                ...item,
                product_id: item.product_id ? Number(item.product_id) : undefined,
                qty: Number(item.qty) || 1
            }));
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
    },

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
    }
};
