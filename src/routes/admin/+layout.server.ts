import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
    // Check if user has session
    const session = cookies.get('admin_session');

    // If no session and not already on login page (redundant check for admin layout but good practice)
    if (!session && url.pathname.startsWith('/admin')) {
        throw redirect(303, '/login');
    }
};
