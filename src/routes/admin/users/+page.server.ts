import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load = async () => {
    return {
        users: db.getUsers().map(({ password_hash, ...u }) => u) // Exclude password_hash
    };
};

export const actions = {
    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = Number(formData.get('id'));

        if (id === 1) {
            return fail(400, { message: 'Cannot delete super admin' });
        }

        if (db.deleteUser(id)) {
            return { success: true };
        }
        return fail(400, { message: 'Failed to delete user' });
    }
};
