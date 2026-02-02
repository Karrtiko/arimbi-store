import { db } from '$lib/server/db';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import fs from 'fs';
import path from 'path';

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;
    const page = db.getPage(slug);

    if (!page) {
        throw error(404, 'Halaman tidak ditemukan');
    }

    return {
        page
    };
};

export const actions: Actions = {
    default: async ({ request, params }) => {
        const { slug } = params;
        const formData = await request.formData();

        // Helper to save file
        const saveFile = async (file: File) => {
            const buffer = Buffer.from(await file.arrayBuffer());
            const ext = file.name.split('.').pop();
            const filename = `${slug}-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

            // Resolves to /app/static/uploads/cms in Docker, or static/uploads/cms locally
            const baseUploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'static', 'uploads');
            const uploadDir = path.join(baseUploadDir, 'cms');

            // Ensure dir exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            fs.writeFileSync(path.join(uploadDir, filename), buffer);
            return `/uploads/cms/${filename}`;
        };

        // Parse content
        const content: any = {};

        // 1. General Text Fields
        for (const [key, value] of formData.entries()) {
            if (typeof value === 'string' &&
                !key.startsWith('hero_image_file') &&
                !key.startsWith('hero_images_upload') &&
                !key.startsWith('hero_images_existing')) {
                content[key] = value;
            }
        }

        // 2. Handle Single Hero Image (About Page)
        const heroImageFile = formData.get('hero_image_file') as File;
        if (heroImageFile && heroImageFile.size > 0) {
            content.hero_image = await saveFile(heroImageFile);
        } else {
            // Check if there's a hidden field with existing value or if it was in text fields
            // The text field 'hero_image' might be populated by the user manually or preserved
            // logic: if 'hero_image' (text) is present, use it. File upload overwrites it.
            if (formData.get('hero_image')) {
                content.hero_image = formData.get('hero_image')?.toString();
            }
        }

        // 3. Handle Multiple Hero Images (Home Page)
        if (slug === 'home') {
            const existingJson = formData.get('hero_images_existing');
            let finalImages = existingJson ? JSON.parse(existingJson.toString()) : [];

            const newFiles = formData.getAll('hero_images_upload') as File[];
            for (const file of newFiles) {
                if (file.size > 0) {
                    const url = await saveFile(file);
                    finalImages.push(url);
                }
            }
            content.hero_images = finalImages;
        }

        // Create directory for uploads if it doesn't exist
        const baseUploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'static', 'uploads');
        const uploadDir = path.join(baseUploadDir, 'cms');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Get current page title for the update
        const currentPage = db.getPage(slug as string);
        if (!currentPage) {
            throw error(404, 'Page not found');
        }

        db.updatePage(slug as string, currentPage.title, content);

        return { success: true };
    }
};
