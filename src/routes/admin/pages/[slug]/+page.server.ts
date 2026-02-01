import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;
    const page = db.getPage(slug);

    if (!page) {
        throw error(404, 'Halaman tidak ditemukan');
    }

    return {
        page
    };
};

export const actions: Actions = {
    default: async ({ request, params }) => {
        const { slug } = params;
        const formData = await request.formData();

        // Convert FormData to JSON object
        const content: any = {};
        for (const [key, value] of formData.entries()) {
            content[key] = value.toString();
        }

        db.savePage(slug as string, content);

        return { success: true };
    }
};
