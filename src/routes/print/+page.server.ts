import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ url }) => {
    const ids = url.searchParams.get('ids')?.split(',') || [];

    if (ids.length === 0) {
        return { transactions: [] };
    }

    // Fetch all transactions and filter (inefficient but works for file DB)
    // Optimized way would be to have getTransactionsByIds but existing function is good enough for MVP
    const allData = db.getTransactions(1, 1000); // Fetch large batch
    const transactions = allData.transactions.filter((t: any) => ids.includes(t.id));

    return {
        transactions
    };
};
