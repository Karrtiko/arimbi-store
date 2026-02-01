import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
    if (params.id === 'new') {
        return { user: null };
    }

    const user = db.getUserById(Number(params.id));
    if (!user) {
        throw redirect(302, '/admin/users');
    }

    // Exclude password_hash
    const { password_hash, ...safeUser } = user;
    return { user: safeUser };
};

export const actions = {
    save: async ({ request, params }) => {
        const formData = await request.formData();
        const username = String(formData.get('username'));
        const role = String(formData.get('role')) as 'admin' | 'staff';
        const password = String(formData.get('password'));

        if (!username) {
            return fail(400, { error: 'Username is required' });
        }

        try {
            if (params.id === 'new') {
                if (!password) {
                    return fail(400, { error: 'Password is required for new users' });
                }
                await db.createUser({
                    username,
                    role,
                    password_hash: password // Will be hashed in db.createUser
                });
            } else {
                const updates: any = { username, role };
                if (password) {
                    updates.password = password; // Will be hashed in db.updateUser
                }
                await db.updateUser(Number(params.id), updates);
            }
        } catch (e: any) {
            return fail(400, { error: e.message });
        }

        throw redirect(302, '/admin/users');
    }
};
