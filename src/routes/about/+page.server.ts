import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const page = db.getPage('about');
    return {
        pageContent: page?.content || {}
    };
};
