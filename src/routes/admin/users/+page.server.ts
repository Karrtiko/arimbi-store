import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load = async () => {
    return {
        users: db.getUsers().map(({ password_hash, ...u }) => u) // Exclude password_hash
    };
};

export const actions = {
    delete: async () => {
        return fail(400, { message: 'User deletion is disabled for security.' });
    }
};
