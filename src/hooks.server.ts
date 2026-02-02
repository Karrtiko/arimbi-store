import { initDatabase, seedDatabase } from '$lib/server/db';
import { initBackupScheduler } from '$lib/server/backup/scheduler';

// Initialize database on server start
initDatabase();
seedDatabase();

// Initialize backup scheduler
initBackupScheduler();

console.log('🚀 Server hooks initialized');

import type { Handle } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export const handle: Handle = async ({ event, resolve }) => {
    // Serve uploads from the mapped directory
    if (event.url.pathname.startsWith('/uploads/')) {
        const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'static', 'uploads');
        // Remove /uploads prefix to get relative path inside folder
        const relativePath = event.url.pathname.replace(/^\/uploads\//, '');
        const filePath = path.join(uploadDir, relativePath);

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'application/octet-stream';

            if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else if (ext === '.png') contentType = 'image/png';
            else if (ext === '.gif') contentType = 'image/gif';
            else if (ext === '.webp') contentType = 'image/webp';
            else if (ext === '.svg') contentType = 'image/svg+xml';

            const fileContent = fs.readFileSync(filePath);
            return new Response(fileContent, {
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=3600'
                }
            });
        }
    }

    const response = await resolve(event);

    // Add Security Headers
    response.headers.set('X-Frame-Options', 'DENY'); // Prevent Clickjacking
    response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME Sniffing
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()'); // Limit browser features

    return response;
};
