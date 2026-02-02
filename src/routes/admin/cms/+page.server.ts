import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
    // This seems to be a legacy route. 
    // Redirect to the new pages management or return DB data if still needed.
    return {
        // Return dummy data or redirect. 
        // Better to return DB data to avoid breaking if accessed.
        cms: { hero: { title: '', subtitle: '', button_text: '' } }, // Placeholder
        countries: db.getCountries()
    };
};

export const actions: Actions = {
    updateHero: async ({ request }) => {
        // This action seems redundant as we use /admin/pages/[slug] for hero updates now.
        // We'll map it to the database 'home' page just in case.
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const subtitle = formData.get('subtitle') as string;

        try {
            const homePage = db.getPage('home');
            if (homePage) {
                const content = JSON.parse(homePage.content || '{}');
                content.hero_title = title;
                content.hero_subtitle = subtitle;

                db.updatePage('home', homePage.title, JSON.stringify(content));
                return { success: true, message: 'Hero updated via legacy route' };
            }
        } catch (e) {
            console.error(e);
        }
        return { success: false, error: 'Failed to update' };

    },

    toggleCountry: async ({ request }) => {
        // Redundant, use /admin/cms/countries
        const formData = await request.formData();
        const id = Number(formData.get('id'));
        const isActive = formData.get('is_active') === 'on' || formData.get('is_active') === 'true';

        try {
            const country = db.getCountryById(id);
            if (country) {
                db.updateCountry({ ...country, is_active: isActive ? 1 : 0 });
                return { success: true };
            }
        } catch (e) {
            return fail(500, { error: 'Failed' });
        }
    }
};
