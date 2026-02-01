import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async ({ url }) => {
    const id = url.searchParams.get('id');
    const categories = db.getCategories();
    const countries = db.getCountries();

    let product = null;
    if (id) {
        product = db.getProducts().find(p => p.id === Number(id));
    }

    return {
        product: product || {},
        categories,
        countries
    };
};

// Helper: Save file to disk
async function saveFile(file: File): Promise<string> {
    const uploadDir = 'static/uploads/products';
    if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
    }

    const ext = file.name.split('.').pop();
    const fileName = `${randomUUID()}.${ext}`;
    const filePath = join(uploadDir, fileName);

    const buffer = await file.arrayBuffer();
    writeFileSync(filePath, Buffer.from(buffer));

    return `/uploads/products/${fileName}`;
}

export const actions: Actions = {
    save: async ({ request, url }) => {
        const data = await request.formData();
        // Check ID from URL or Body (hidden input)
        const id = url.searchParams.get('id') || data.get('id');

        // Extract basic fields
        const name = data.get('name') as string;
        // Basic slug from name
        let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Ensure slug uniqueness if creating new
        // If updating, we keep existing slug OR update it? usually keep. 
        // But for now let's just make sure we don't collide if it's a NEW product.
        if (!id) {
            const existing = db.getProductBySlug(slug);
            if (existing) {
                slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
            }
        }

        const price = Number(data.get('price'));
        const stock = Number(data.get('stock')) || 0;
        const category_id = Number(data.get('category_id'));
        const country_id = Number(data.get('country_id'));
        const description = data.get('description') as string;

        // Handle Images
        // 1. Existing images (JSON string of array)
        let existingImages: string[] = [];
        try {
            existingImages = JSON.parse(data.get('existing_images') as string || '[]');
        } catch (e) { }

        // 2. New uploaded files
        const newFiles = data.getAll('new_images') as File[];
        const newImagePaths: string[] = [];

        for (const file of newFiles) {
            if (file.size > 0 && file.name && file.name !== 'undefined') {
                const path = await saveFile(file);
                newImagePaths.push(path);
            }
        }

        // Combine all images
        const allImages = [...existingImages, ...newImagePaths];

        // Determine Thumbnail
        let image_url = data.get('selected_thumbnail') as string;

        // Fallback or explicit check
        if (!image_url || !allImages.includes(image_url)) {
            // If we have images, default to first one
            image_url = allImages.length > 0 ? allImages[0] : '/images/products/placeholder.jpg';
        }

        // Extract Dynamic Attributes
        const attrKeys = data.getAll('attr_keys') as string[];
        const attrValues = data.getAll('attr_values') as string[];

        const attributes: Record<string, string> = {};

        // Safety check: ensure both are arrays (getAll returns array but just in case)
        if (Array.isArray(attrKeys) && Array.isArray(attrValues)) {
            attrKeys.forEach((key, index) => {
                const cleanKey = key?.trim();
                const cleanVal = attrValues[index]?.trim() || '';

                if (cleanKey) {
                    attributes[cleanKey] = cleanVal;
                }
            });
        }

        if (!name || !price) {
            return fail(400, { error: 'Name and Price are required' });
        }

        const isActive = data.get('is_active') ? 1 : 0;

        const productData = {
            name,
            slug,
            price,
            stock,
            category_id,
            country_id,
            description,
            image_url,      // Main thumbnail
            images: allImages, // Full gallery
            attributes,
            is_featured: 1,
            is_active: isActive
        };

        if (id && !isNaN(Number(id))) {
            db.updateProduct(Number(id), productData);
        } else {
            db.addProduct(productData);
        }

        throw redirect(303, '/admin/products');
    }
};
