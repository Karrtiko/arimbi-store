import { jsonDb } from '$lib/server/data';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
    const data = jsonDb.get();
    return {
        cms: data.cms,
        countries: data.countries
    };
};

export const actions: Actions = {
    updateHero: async ({ request }) => {
        const formData = await request.formData();
        const data = jsonDb.get();

        data.cms.hero.title = formData.get('title') as string;
        data.cms.hero.subtitle = formData.get('subtitle') as string;
        data.cms.hero.button_text = formData.get('button_text') as string;

        jsonDb.write();
        return { success: true, message: 'Hero updated' };
    },

    toggleCountry: async ({ request }) => {
        const formData = await request.formData();
        const id = Number(formData.get('id'));
        const isActive = formData.get('is_active') === 'on';

        const data = jsonDb.get();
        const country = data.countries.find(c => c.id === id);
        if (country) {
            country.is_active = isActive;
            jsonDb.write();
        }
    }
};
