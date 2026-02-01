import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const product = db.getProductWithDetails(params.slug);

	if (!product) {
		throw error(404, 'Produk tidak ditemukan');
	}

	// Get related products (same category, different product)
	const allProducts = db.getProductsWithDetails({ category: product.category_slug });
	const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 3);

	// Get settings for WhatsApp number
	const settings = db.getSettings();

	return {
		product,
		relatedProducts,
		adminWhatsApp: settings.admin_whatsapp || '6281234567890'
	};
};
