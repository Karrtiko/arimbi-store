import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;
    const bundle = db.getBundles().find((b) => b.slug === slug);

    if (!bundle) {
        throw error(404, 'Bundle not found');
    }

    // Enrich items with product details if needed (db adapter might already do this, checking...)
    // Actually db.getBundles() in memory implementation likely returns items as is.
    // Ideally we want product details (images, slugs) for the "what's inside" section.

    // Let's manually enrich here to be safe if db doesn't deep populate
    const products = db.getProducts();
    const enrichedItems = bundle.items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
            ...item,
            product_name: product?.name || 'Unknown Product',
            product_slug: product?.slug || '#',
            product_image: product?.image_url || '',
            product_stock: product?.stock || 0
        };
    });

    return {
        bundle: {
            ...bundle,
            items: enrichedItems
        }
    };
};
