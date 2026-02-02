import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';

export const load = async () => {
    return {
        users: db.getUsers().map(({ password_hash, ...u }) => u) // Exclude password_hash
    };
};

export const actions = {
    delete: async ({ request, cookies }) => {
        const formData = await request.formData();
        const id = Number(formData.get('id'));

        // Get Current User ID from session
        const session = cookies.get('admin_session');
        let currentUserId = -1;
        if (session) {
            try {
                const currentUser = JSON.parse(session);
                currentUserId = currentUser.id;
            } catch (e) { }
        }

        if (id === currentUserId) {
            return fail(400, { message: 'Cannot delete yourself' });
        }

        const user = db.getUserById(id);
        if (!user) return fail(404, { message: 'User not found' });

        // Protect Super Admin
        if (user.username === 'admin') {
            return fail(400, { message: 'Cannot delete super admin user' });
        }

        if (db.deleteUser(id)) {
            return { success: true };
        }
        return fail(400, { message: 'Failed to delete user' });
    }
};
