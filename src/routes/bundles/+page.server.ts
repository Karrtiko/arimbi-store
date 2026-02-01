import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const bundles = db.getBundles().filter((b) => b.is_active);
    return {
        bundles
    };
};
