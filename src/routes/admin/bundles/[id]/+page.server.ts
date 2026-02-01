import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
    const products = db.getProducts({}).map(p => ({ id: p.id, name: p.name, price: p.price, image_url: p.image_url }));

    if (params.id === 'new') {
        return {
            bundle: null,
            products
        };
    }

    const bundle = db.getBundleWithDetails(params.id); // Assuming getBundleWithDetails can take ID or we fetch by ID first
    // Actually, helper takes slug. Let's find by ID first.
    // We don't have getBundleById helper exported directly, but getBundles returns array.
    const allBundles = db.getBundles(false);
    const bundleData = allBundles.find(b => b.id === Number(params.id));

    if (!bundleData) {
        throw redirect(302, '/admin/bundles');
    }

    // Since basic bundle data doesn't have item details (price/name), let's manually enrich for the client form
    const enrichedItems = bundleData.items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
            ...item,
            product_name: product?.name || 'Unknown',
            product_price: product?.price || 0,
            product_image: product?.image_url || ''
        };
    });

    return {
        bundle: { ...bundleData, items: enrichedItems },
        products
    };
};

export const actions = {
    save: async ({ request, params }) => {
        const formData = await request.formData();
        const name = String(formData.get('name'));
        const description = String(formData.get('description'));
        const imagesJson = String(formData.get('images')); // Existing images
        const stock = Number(formData.get('stock'));
        const price = Number(formData.get('price'));
        const itemsJson = String(formData.get('items'));
        const isActive = formData.get('is_active') === 'on';

        // File upload handling
        const newImages = formData.getAll('new_images');
        const uploadedPaths: string[] = [];

        if (newImages && newImages.length > 0) {
            const fs = await import('fs');
            const path = await import('path');
            const crypto = await import('crypto');

            const uploadDir = path.join(process.cwd(), 'static', 'uploads', 'bundles');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            for (const file of newImages) {
                if (file instanceof File && file.size > 0) {
                    const ext = path.extname(file.name);
                    const filename = `${crypto.randomUUID()}${ext}`;
                    const buffer = await file.arrayBuffer();
                    fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(buffer));
                    uploadedPaths.push(`/uploads/bundles/${filename}`);
                }
            }
        }

        let items = [];
        let existingImages = [];
        try {
            items = JSON.parse(itemsJson) || [];
            existingImages = JSON.parse(imagesJson) || [];
        } catch (e) {
            return fail(400, { message: 'Invalid items or images data' });
        }

        const finalImages = [...existingImages, ...uploadedPaths];
        const selectedThumbnail = String(formData.get('selected_thumbnail'));
        const selectedNewIndex = Number(formData.get('selected_new_index'));

        // Determine main image:
        // 1. If user selected a NEW image, use the corresponding uploaded path
        // 2. Else if user selected an EXISTING image, use it
        // 3. Fallback to first image
        let mainImage = finalImages.length > 0 ? finalImages[0] : '';

        if (selectedNewIndex >= 0 && selectedNewIndex < uploadedPaths.length) {
            mainImage = uploadedPaths[selectedNewIndex];
        } else if (selectedThumbnail && finalImages.includes(selectedThumbnail)) {
            mainImage = selectedThumbnail;
        }

        if (!name || items.length === 0) {
            return fail(400, { message: 'Name and at least one item are required' });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const bundleData = {
            name,
            slug,
            description,
            image_url: mainImage,
            images: finalImages,
            price,
            stock,
            items: items.map((i: any) => ({ product_id: i.product_id, quantity: i.quantity })),
            is_active: isActive
        };

        if (params.id === 'new') {
            db.createBundle(bundleData);
        } else {
            db.updateBundle(Number(params.id), bundleData);
        }

        throw redirect(302, '/admin/bundles');
    }
};
