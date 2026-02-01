import { db } from '$lib/server/db';

export const load = async () => {
    const bundles = db.getBundles(false); // Get all bundles including inactive

    // Enrich with item count or details if needed for the table
    // For now, listing basic details is enough
    const enrichedBundles = bundles.map(b => {
        // Calculate total items
        const itemCount = b.items.reduce((sum, item) => sum + item.quantity, 0);
        return {
            ...b,
            item_count: itemCount
        };
    });

    return {
        bundles: enrichedBundles
    };
};

export const actions = {
    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = Number(formData.get('id'));
        if (id) {
            db.deleteBundle(id);
            return { success: true };
        }
        return { success: false };
    },
    toggle: async ({ request }) => {
        const formData = await request.formData();
        const id = Number(formData.get('id'));
        const currentState = formData.get('current_state') === 'true';

        if (id) {
            db.updateBundle(id, { is_active: !currentState });
            return { success: true };
        }
        return { success: false };
    }
};
