import { db } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export const load: PageServerLoad = async () => {
    // Get first product with image for preview
    const products = db.getProducts();
    const sampleProduct = products.find(p => p.image_url) || null;

    return {
        settings: db.getSettings(),
        sampleImageUrl: sampleProduct?.image_url || null
    };
};

async function saveFile(file: File): Promise<string> {
    const uploadDir = 'static/uploads/watermarks';
    if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `watermark-${Date.now()}-${file.name}`;
    const filePath = join(uploadDir, fileName);

    const buffer = await file.arrayBuffer();
    writeFileSync(filePath, Buffer.from(buffer));

    return `/uploads/watermarks/${fileName}`;
}

export const actions: Actions = {
    save: async ({ request }) => {
        const data = await request.formData();

        const opacity = Number(data.get('opacity'));
        const scale = Number(data.get('scale'));
        const position = data.get('position') as string;

        const file = data.get('watermark_file') as File;
        let watermark_path = data.get('current_watermark_path') as string;

        if (file && file.size > 0 && file.name !== 'undefined') {
            watermark_path = await saveFile(file);
        }

        db.updateSettings({
            watermark_opacity: opacity,
            watermark_scale: scale,
            watermark_position: position,
            watermark_path: watermark_path
        });

        return { success: true };
    }
};
