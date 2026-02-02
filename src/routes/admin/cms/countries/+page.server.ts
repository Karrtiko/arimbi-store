import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
    return {
        countries: db.getCountries()
    };
};

export const actions: Actions = {
    addCountry: async ({ request }) => {
        try {
            const formData = await request.formData();
            const name = formData.get('name') as string;
            const flagEmoji = formData.get('flag_emoji') as string;

            if (!name) {
                return fail(400, { error: 'Country name is required' });
            }

            // Create slug and code
            const slug = name.toLowerCase().replace(/\s+/g, '-');
            const code = name.substring(0, 2).toUpperCase();

            // Add new country via DB
            db.addCountry({
                name,
                slug,
                code,
                flag_emoji: flagEmoji || '🏳️',
                is_active: 1
            });

            return { success: true, message: 'Country added successfully!' };
        } catch (error) {
            console.error('Add country error:', error);
            return fail(500, { error: 'Failed to add country' });
        }
    },

    editCountry: async ({ request }) => {
        try {
            const formData = await request.formData();
            const countryId = parseInt(formData.get('id') as string);
            const name = formData.get('name') as string;
            const flagEmoji = formData.get('flag_emoji') as string;

            if (!name) {
                return fail(400, { error: 'Country name is required' });
            }

            const country = db.getCountryById(countryId);
            if (!country) return fail(404, { error: 'Country not found' });

            // Update fields
            db.updateCountry({
                id: countryId,
                name,
                slug: name.toLowerCase().replace(/\s+/g, '-'),
                code: name.substring(0, 2).toUpperCase(),
                flag_emoji: flagEmoji || country.flag_emoji || '🏳️',
                is_active: country.is_active // keep existing status
            });

            return { success: true, message: 'Country updated successfully!' };
        } catch (error) {
            console.error('Edit country error:', error);
            return fail(500, { error: 'Failed to update country' });
        }
    },

    toggleCountry: async ({ request }) => {
        try {
            const formData = await request.formData();
            const countryId = parseInt(formData.get('id') as string);
            // Convert string "true" to boolean, then to 1/0 for SQLite
            const isActive = formData.get('is_active') === 'true' ? 1 : 0;

            const country = db.getCountryById(countryId);
            if (!country) return fail(404, { error: 'Country not found' });

            // Update only is_active
            db.updateCountry({
                ...country,
                is_active: isActive
            });

            return { success: true };
        } catch (error) {
            console.error('Toggle country error:', error);
            return fail(500, { error: 'Failed to toggle country' });
        }
    }
};
