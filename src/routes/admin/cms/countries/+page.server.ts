import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { jsonDb } from '$lib/server/data';

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

            // Get all countries
            const countries = db.getCountries();

            // Generate new ID
            const newId = Math.max(...countries.map((c: any) => c.id || 0), 0) + 1;

            // Create slug from name
            const slug = name.toLowerCase().replace(/\s+/g, '-');

            // Auto-generate code from first 2 letters of name
            const code = name.substring(0, 2).toUpperCase();

            // Add new country
            const newCountry = {
                id: newId,
                code: code,
                name: name,
                slug: slug,
                flag_emoji: flagEmoji || '🏳️',
                created_at: new Date().toISOString(),
                is_active: true
            };

            countries.push(newCountry);

            // Save to file
            jsonDb.write();

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

            // Get all countries
            const countries = db.getCountries();
            const country = countries.find((c: any) => c.id === countryId);

            if (!country) {
                return fail(404, { error: 'Country not found' });
            }

            // Update country data
            country.name = name;
            country.slug = name.toLowerCase().replace(/\s+/g, '-');
            country.flag_emoji = flagEmoji || country.flag_emoji || '🏳️';
            country.code = name.substring(0, 2).toUpperCase();

            // Save to file
            jsonDb.write();

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
            const isActive = formData.get('is_active') === 'true';

            // Get all countries
            const countries = db.getCountries();
            const country = countries.find((c: any) => c.id === countryId);

            if (!country) {
                return fail(404, { error: 'Country not found' });
            }

            // Update the country
            country.is_active = isActive;

            // Save to file
            jsonDb.write();

            return { success: true };
        } catch (error) {
            console.error('Toggle country error:', error);
            return fail(500, { error: 'Failed to toggle country' });
        }
    }
};
