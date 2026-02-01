import { db } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
    const settings = db.getSettings();
    return {
        settings: {
            admin_whatsapp: (settings as any).admin_whatsapp || '6281234567890', // Default fallback
            ...settings
        }
    };
};
