import { db } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    // Get params
    const search = url.searchParams.get('q')?.toLowerCase() || '';
    const categoryId = Number(url.searchParams.get('cat')) || 0;
    const sortBy = url.searchParams.get('sort') || 'newest'; // newest, name, stock_low, stock_high

    let products = db.getProductsWithDetails();

    // Filter
    if (search) {
        products = products.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.slug.includes(search)
        );
    }

    if (categoryId) {
        products = products.filter(p => p.category_id === categoryId);
    }

    // Sort
    products.sort((a, b) => {
        switch (sortBy) {
            case 'name': return a.name.localeCompare(b.name);
            case 'name_desc': return b.name.localeCompare(a.name);
            case 'price_high': return b.price - a.price;
            case 'price_low': return a.price - b.price;
            case 'stock_low': return (a.stock || 0) - (b.stock || 0);
            case 'stock_high': return (b.stock || 0) - (a.stock || 0);
            case 'newest':
            default: return b.id - a.id;
        }
    });

    return {
        products,
        categories: db.getCategories(),
        filters: { search, categoryId, sortBy }
    };
};

export const actions: Actions = {
    delete: async ({ request }) => {
        const data = await request.formData();
        const id = Number(data.get('id'));
        if (id) {
            db.deleteProduct(id);
        }
    }
};
