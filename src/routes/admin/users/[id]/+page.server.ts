import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';

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
    save: async ({ request, params, cookies }) => {
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

                const hashedPassword = await bcrypt.hash(password, 10);

                await db.createUser(username, hashedPassword, role);

            } else {
                const updates: any = { username, role };
                const isPasswordUpdate = password && password.trim() !== '';

                if (isPasswordUpdate) {
                    updates.password_hash = await bcrypt.hash(password, 10);
                }

                await db.updateUser(Number(params.id), updates);

                // Auto Logout if updating OWN password
                if (isPasswordUpdate) {
                    const session = cookies.get('admin_session');
                    if (session) {
                        try {
                            const currentUser = JSON.parse(session);
                            if (currentUser.id === Number(params.id)) {
                                cookies.delete('admin_session', { path: '/' });
                                throw redirect(303, '/login?message=Password changed. Please login again.');
                            }
                        } catch (e) {
                            // JSON parse error or redirect error?
                            if (e instanceof Error && e.message.includes('Redirect')) throw e;
                        }
                    }
                }
            }
        } catch (e: any) {
            if (e?.status === 303 || e?.status === 302) throw e; // Re-throw redirects
            console.error(e);
            return fail(400, { error: e.message || 'Failed to save user' });
        }

        throw redirect(302, '/admin/users');
    }
};
