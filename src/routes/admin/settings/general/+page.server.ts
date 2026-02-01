import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
    const settings = db.getSettings();

    return {
        settings: {
            admin_whatsapp: settings.admin_whatsapp || '',
            low_stock_threshold: settings.low_stock_threshold || 10,
            products_per_page_catalog: settings.products_per_page_catalog || 15,
            products_per_category_home: settings.products_per_category_home || 5,
            best_sellers_limit: settings.best_sellers_limit || 10
        }
    };
};

export const actions: Actions = {
    updateSettings: async ({ request }) => {
        try {
            const formData = await request.formData();

            const admin_whatsapp = formData.get('admin_whatsapp') as string;
            const low_stock_threshold = parseInt(formData.get('low_stock_threshold') as string);
            const products_per_page_catalog = parseInt(formData.get('products_per_page_catalog') as string);
            const products_per_category_home = parseInt(formData.get('products_per_category_home') as string);
            const best_sellers_limit = parseInt(formData.get('best_sellers_limit') as string);

            // Validation
            if (!admin_whatsapp || !admin_whatsapp.match(/^62\d{9,13}$/)) {
                return fail(400, {
                    error: 'Nomor WhatsApp tidak valid. Format: 62xxx (tanpa +)',
                    admin_whatsapp
                });
            }

            if (low_stock_threshold < 1 || low_stock_threshold > 100) {
                return fail(400, { error: 'Low stock threshold harus antara 1-100' });
            }

            if (products_per_page_catalog < 5 || products_per_page_catalog > 100) {
                return fail(400, { error: 'Products per page harus antara 5-100' });
            }

            // Update settings
            db.updateSettings({
                admin_whatsapp,
                low_stock_threshold,
                products_per_page_catalog,
                products_per_category_home,
                best_sellers_limit
            });

            return { success: true };
        } catch (error) {
            console.error('Error updating settings:', error);
            return fail(500, { error: 'Gagal menyimpan pengaturan' });
        }
    }
};
