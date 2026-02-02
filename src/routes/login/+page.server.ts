import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
    const session = cookies.get('admin_session');
    if (session) {
        throw redirect(303, '/admin');
    }
    return {};
};

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const loginAttempts = new Map<string, { count: number, resetTime: number }>();

export const actions: Actions = {
    default: async ({ cookies, request }) => {
        const data = await request.formData();
        const username = data.get('username') as string;
        const password = data.get('password') as string;

        // Basic Rate Limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const key = `${ip}-${username}`;
        const now = Date.now();

        let record = loginAttempts.get(key);
        if (!record || now > record.resetTime) {
            record = { count: 0, resetTime: now + WINDOW_MS };
        }

        if (record.count >= MAX_ATTEMPTS) {
            const waitTime = Math.ceil((record.resetTime - now) / 60000);
            return fail(429, { message: `Terlalu banyak percobaan. Coba lagi dalam ${waitTime} menit.` });
        }

        // Update attempts
        record.count++;
        loginAttempts.set(key, record);

        // Initialize DB (creates default admin if needed)
        // In a real app, verify initDatabase is called at startup
        const { db, initDatabase } = await import('$lib/server/db');
        initDatabase();

        console.log(`[LOGIN ATTEMPT] Username: ${username}`);
        const user = db.getUserByUsername(username);

        if (user) {
            // @ts-ignore
            const bcrypt = (await import('bcryptjs')).default;
            const valid = await bcrypt.compare(password, user.password_hash);

            console.log(`[LOGIN DEBUG] User found. ID: ${user.id}. Hash valid: ${valid}`);

            if (valid) {
                // Clear attempts on success
                loginAttempts.delete(key);

                // Create session
                console.log('[LOGIN SUCCESS] Setting cookie...');
                cookies.set('admin_session', JSON.stringify({ id: user.id, role: user.role }), {
                    path: '/',
                    httpOnly: true,
                    sameSite: 'lax', // Changed from strict to lax for easier debugging/redirects
                    secure: false, // process.env.NODE_ENV === 'production', // DISABLE SECURE FOR LOCALHOST DEBUGGING
                    maxAge: 60 * 60 * 24 // 1 day
                });
                return redirect(303, '/admin');
            } else {
                console.log('[LOGIN FAILED] Invalid password');
            }
        } else {
            console.log('[LOGIN FAILED] User not found in DB');
        }

        return fail(400, {
            error: 'Invalid username or password',
            username
        });
    }
};
